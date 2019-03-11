---
layout: post
title: Kubernetes Init Containers promises
date: 2019-03-11
description: What is really promised as it comes to Kubernetes Init Containers?
category: blog
tag:
- linux
- docker
- deployment
- software
- kubernetes
comments: true
image: assets/containers.jpg
---

Some time ago, I wrote about my current project, and how did we tackle the issue of passing node labels to pods in [Kubernetes](https://kubernetes.io) context. The solution worked (and still does), but there was a caveat to it, which I'd like to share in this short article.

## Brief introduction to the problem

In this article [https://gmaslowski.com/kubernetes-node-label-to-pod/](https://gmaslowski.com/kubernetes-node-label-to-pod/) I described how we've passed k8s node labels to the deployed pods. Not to repeat myself, I used [Init Containers](https://kubernetes.io/docs/concepts/workloads/pods/init-containers/) with a volume mount shared between the init and app container. If you'd like to get more details about it, I advise you to read the aforementioned article.

But, what's worth mentioning for this story, is that the *init container* was able to control our k8s cluster (to obtain node label) and with this script:
{% highlight yaml %}
cp /cassandra/cassandra-rackdc.properties /shared/cassandra-rackdc.properties && 
sed -i.bak s/RACK/$(kubectl get no -Lvm/rack | grep ${NODE_NAME} | awk '{print $6}')/g /shared/cassandra-rackdc.properties
{% endhighlight %}
a template (coming from a `configMap` volume) was filled and copied to a *shared* volume, which then was used by the app containers. Everything was fine and working, because of the [*promises*](https://kubernetes.io/docs/concepts/workloads/pods/init-containers/#understanding-init-containers) which are brought by init containers:

- started before app containers are
- always run to completion
- on failure, restart the whole pod (according to its *restartPolicy*)

### Symptoms

So far, so good. With this configuration and the promises in mind, our setup was expected to always have a */etc/cassandra/cassandra-rackdc.properties* file with the following content:
{% highlight yaml %}
dc=customDataCenter
rack=customServer-<X>
{% endhighlight %}
coming from a template defined like this:
{% highlight yaml %}
dc=customDataCenter
rack=RACK
{% endhighlight %}
 
 Everything was great, until one time we saw, that one of the [Cassandra](http://cassandra.apache.org/) nodes cannot start because the persisted data refer to a different rack (unfortunately I did not preserve the actual log) with value `RACK`. 

### Cause

We quickly found out, that the node with the failing cassandra pod had udergone some maintenance work, including [Docker](https://docker.io) upgrade, which forced a docker daemon  restart. Bum. Got you. Deletion of the failing pod solved the issue (by recreating it). Tried restarting docker deamon on another node with cassandra - same issue. At least we're able to recreate it :). 

### We need to go deeper (we always do... always)

Further investigation revealed the following:

- with every docker daemon restart, the init containers were restarted as well
- it takes ~5 seconds to complete the `kubectl get no -Lvm/rack | grep ${NODE_NAME} | awk '{print $6}'`command
- the `volume mount` on init container side contains  **proper** `rack` value in cassandra config file
- the mounted file into app container (via `subpath`) contains **wrong** `rack` value in cassandra config file

> this requires some comment, as we run a [Stacked High Available Kubeadm Cluster](https://kubernetes.io/docs/setup/independent/high-availability/) with 3 masters and external LB to route traffic to the api-servers:
![Stacked Topology with etcd]({{ site.url }}/assets/k8s-topology-stacked.jpg) And thus, making the `kubectl` command call slower. 

And now, bummer. How can all of it be? Why the init container is being (re)started? Where do the inconsistencies between volume mount inside the init container and app container come from? 

## Quick? go through the documentation

So let us review documentation, to gather more information. From [https://kubernetes.io/docs/concepts/workloads/pods/init-containers/#detailed-behavior](https://kubernetes.io/docs/concepts/workloads/pods/init-containers/#detailed-behavior)

> Because Init Containers can be restarted, retried, or re-executed, Init Container code should be idempotent. In particular, code that writes to files on EmptyDirs should be prepared for the possibility that an output file already exists.

Ok, that doesn't explain a lot, but at least shows a direction. Our script is not idempotent at all! There's a time interval - a ~5 seconds one - during which the value is the *to-be-substituted*  one. Remember the script?

{% highlight yaml %}
cp /cassandra/cassandra-rackdc.properties /shared/cassandra-rackdc.properties && 
sed -i.bak s/RACK/$(kubectl get no -Lvm/rack | grep ${NODE_NAME} | awk '{print $6}')/g /shared/cassandra-rackdc.properties
{% endhighlight %}

First we copy, than we substitute. Apparently, after the template file was copied, it was picked by the app container (which in our docker-deamon-restart case starts in the same time as the init container). What's more, the init container script gets executed every time the init container runs, regardless of the fact that it had already calculated the proper `rack` value. Can the solution be that simple?

## A really simple solution 

So.. turns out that the solution, to the couple-mindfuck-hours-long issue  might be really simple. Changed the script to the following:
{% highlight yaml %}
test -f /shared/cassandra-rackdc.properties && \
           echo 'File exists. Not overwriting.' || 
           (cp /cassandra/cassandra-rackdc.properties /shared/cassandra-rackdc.properties && \
           sed -i.bak s/RACK/$(kubectl get no -Lrvm/rack | grep ${NODE_NAME} | awk '{print $6}')/g /shared/cassandra-rackdc.properties)"
{% endhighlight %}

Retried the failing scenario and... a success! Another job done.

## Mystery?

But one thing still bothers me, and I haven't understood it so far. Why, in the hell, the cassandra app container kept failing every restart? I mean, in the init container the mount volume eventually got the file with right value. So why the app container didn't? It's a shared volume between those two. Is it because of the `subpath volume mount`? I did not go through k8s code to find it out. If you have an answer, just let me know!

## Links
- [https://kubernetes.io/docs/tasks/configure-pod-container/configure-pod-initialization/](https://kubernetes.io/docs/tasks/configure-pod-container/configure-pod-initialization/)
- [https://kubernetes.io/docs/concepts/workloads/pods/init-containers/#detailed-behavior](https://kubernetes.io/docs/concepts/workloads/pods/init-containers/#detailed-behavior)
- [https://kubernetes.io/docs/setup/independent/high-availability/](https://kubernetes.io/docs/setup/independent/high-availability/)