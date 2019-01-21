---
layout: post
title: Docker shell vs. exec form
date: 2019-01-21
description: Why you might fail with proper docker service shutdown.
category: blog
tag:
- linux
- docker
- deployment
- software
comments: true
---

At home, in work, in side projects I containerize... For which purposes I containarize you might ask? For many reasons basically:
- CI/CD - for having repeatable builds and tests, while almost totally ignoring underlying OS configuration
- automatically run software I write in a clustered manner
- manage the software I write in a common way, by using container orchestrators like Docker [Swarm](https://docs.docker.com/engine/swarm/) or [Kubernetes](https://kubernetes.io/)

As it is quite common in modern world, it all comes with a price to pay. And the price is called: *abstraction*. I remember someone said that 
> Every abstraction layer solves one problem, by introducing ten different ones.

Or somethng quite close to that. Of course, that is a oversimplication (still being truth), but I wouldn't change the docker abstraction for now, due to the benefits it gives me. This post, however, is not about the benefits but about a specific issue, which I was not aware of for quite a long time. It's related with running apps, commands inside the containers. And more closely, about stopping them.

## How to specify run commands in docker?

I have created a sample project for this post, which can be found at [https://github.com/gmaslowski/docker-shell-vs-exec](https://github.com/gmaslowski/docker-shell-vs-exec). This project has a simple Spring based app and some Docker descriptor files, for building images and setting up container with *docker-compose* (please note, that described issues should correspond to any form of starting a docker container).

The simple snippet project focuses on two ways of executing commands inside a docker container:
- shell form
- exec form  

If we build the application and the docker images, as specified in the `README`, like this:

{% highlight bash %}
./gradlew clean build
cp build/libs/docker-shell-vs-exec-0.0.1-SNAPSHOT.jar docker-shell/app.jar
cp build/libs/docker-shell-vs-exec-0.0.1-SNAPSHOT.jar docker-exec/app.jar
docker build --build-arg JAR_FILE=build/libs/docker-shell-vs-exec-0.0.1-SNAPSHOT.jar docker-exec -t dsve:exec
docker build --build-arg JAR_FILE=build/libs/docker-shell-vs-exec-0.0.1-SNAPSHOT.jar docker-shell -t dsve:shell
{% endhighlight %}

We will end up with two images:
- `dsve:shell` - executing the Spring app in *shell form* 
- `dsve:exec` - executing the Spring app in *exec form* 

By running following script, we will deploy and run our containers by docker compose:
{% highlight bash %}
docker-compose -f deployment/docker-compose.yml up -d
{% endhighlight %}

The actual docker runtime should have the following form:

{% highlight bash %}
/c/dev_env/projects/private/docker-shell-vs-exec (master)
$ docker ps
CONTAINER ID        IMAGE               COMMAND                  CREATED              STATUS              PORTS               NAMES
bd9e3f85a7b0        dsve:shell          "/bin/sh -c 'java -X…"   About a minute ago   Up 56 seconds                           deployment_dsve-shell_1
f0ae8ce0cbc8        dsve:exec           "java -XX:+ExitOnOut…"   About a minute ago   Up 56 seconds                           deployment_dsve-exec_1
{% endhighlight %}

Already in the `COMMAND` section one can see both ways (*shell* and *exec*) of executing the java app inside the container. Let us have a quick look onto the processes inside both containers.

{% highlight bash %}
/c/dev_env/projects/private/docker-shell-vs-exec (master)
$ docker exec -it bd9 sh
/ # ps uxa
PID   USER     TIME   COMMAND
    1 root       0:00 /bin/sh -c java -XX:+ExitOnOutOfMemoryError -Djava.securi
    5 root       0:08 java -XX:+ExitOnOutOfMemoryError -Djava.security.egd=file
   33 root       0:00 sh
   37 root       0:00 ps uxa

/c/dev_env/projects/private/docker-shell-vs-exec (master)
$ docker exec -it f0 sh
/ # ps uxa
PID   USER     TIME   COMMAND
    1 root       0:08 java -XX:+ExitOnOutOfMemoryError -Djava.security.egd=file
   27 root       0:00 sh
   32 root       0:00 ps uxa
{% endhighlight %}

The difference is easy to spot, the same *java* command, one started with `/bin/sh` and the other without it. 

## What docker says about those two forms?
Well, it says many things, and it also describes the difference between *shell* and *exec* form. From my point of view, such details are commonly in places which are easy to overlook, and if you're as impatient and careless :) as I am - you probably will overlook them as well. Careful reading of the docker documentation is strongly advised - [https://docs.docker.com/engine/reference/builder/#entrypoint](https://docs.docker.com/engine/reference/builder/#entrypoint). 

## Yes, ok, but what implications does it have?

### Evironment variables substitution
In a *shell form*, all environment variables will be evaluated as the actual provided command will be run with in a shell by prepending `/bin/sh -c` before it, can also be seen in the previous section. In the *exec form*, however, there is no shell processing involved and the executable is being called directly. So please make sure that your env vars are being substituted before or that the executable you invoke does it.

### RUN, ENTRYPOINT and CMD
I don't want to explain the differences in much detail. `RUN` is being used when building the image, `ENTRYPOINT` and `CMD` serve the purpose of starting the actuall container and parameterize it when needed. Here [http://goinbigdata.com/docker-run-vs-cmd-vs-entrypoint/](http://goinbigdata.com/docker-run-vs-cmd-vs-entrypoint/) you can find a really great explanation of the difference and doesn't make sense to duplicate the content. Additionally it has also been explained quite well in the Docker documentation in the section [understand-how-cmd-and-entrypoint-interact](https://docs.docker.com/engine/reference/builder/#understand-how-cmd-and-entrypoint-interact).

### Gracefully stopping a container
Here we can get into troubles. If we try to stop a container with the *shell form* 
{% highlight bash %}
/c/dev_env/projects/private/docker-shell-vs-exec (master)
$ docker stop bd9
{% endhighlight %}

there's a significant time, which we might notice before the container stops. That's because we extended the `stop_grace_period` from the default 10s to 30s - mainly for the presentation purposes. But if you look closely into the logs, you won't find any information from the Spring application notifying that the system sent a `SIGTERM` signal. That's due to the fact that this signal was send actually to the shell, which doesn't pass any signals. It is documented on [Docker pages](https://docs.docker.com/engine/reference/builder/#entrypoint), however it is quite easy to miss that - I know I was myself not aware of those implications for a long time. And hence, after the `stop_grace_period` passes, docker daemon sends a `SIGKILL` signal cause the container to stop, forcefully. 

On the other hand, the *exec form* stops almost immediately
{% highlight bash %}
/c/dev_env/projects/private/docker-shell-vs-exec (master)
$ docker stop f0a
{% endhighlight %}

and in the logs we cas spot that Sring based application handled the `SIGTERM` command allowing to close all obtained resources:
{% highlight bash %}
/c/dev_env/projects/private/docker-shell-vs-exec (master)
$ docker logs f0a --tail=10
2019-01-21 17:44:39.089  INFO 1 --- [           main] o.s.web.servlet.DispatcherServlet        : FrameworkServlet 'dispatcherServlet': initialization completed in 28 ms
2019-01-21 17:44:39.163  INFO 1 --- [           main] o.e.jetty.server.AbstractConnector       : Started ServerConnector@7a3d45bd{HTTP/1.1,[http/1.1]}{0.0.0.0:8080}
2019-01-21 17:44:39.164  INFO 1 --- [           main] .s.b.c.e.j.JettyEmbeddedServletContainer : Jetty started on port(s) 8080 (http/1.1)
2019-01-21 17:44:39.174  INFO 1 --- [           main] com.gmaslowski.dsve.SampleApplication    : Started SampleApplication in 6.492 seconds (JVM running for 7.867)
2019-01-21 18:21:42.328  INFO 1 --- [      Thread-11] ationConfigEmbeddedWebApplicationContext : Closing org.springframework.boot.context.embedded.AnnotationConfigEmbeddedWebApplicationContext@2401f4c3: startup date [Mon Jan 21 17:44:33 GMT 2019]; root of context hierarchy
2019-01-21 18:21:42.341  INFO 1 --- [      Thread-11] o.s.j.e.a.AnnotationMBeanExporter        : Unregistering JMX-exposed beans on shutdown
2019-01-21 18:21:42.394  INFO 1 --- [      Thread-11] o.e.jetty.server.AbstractConnector       : Stopped ServerConnector@7a3d45bd{HTTP/1.1,[http/1.1]}{0.0.0.0:8080}
2019-01-21 18:21:42.395  INFO 1 --- [      Thread-11] org.eclipse.jetty.server.session         : Stopped scavenging
2019-01-21 18:21:42.412  INFO 1 --- [      Thread-11] o.e.j.s.h.ContextHandler.application     : Destroying Spring FrameworkServlet 'dispatcherServlet'
2019-01-21 18:21:42.425  INFO 1 --- [      Thread-11] o.e.jetty.server.handler.ContextHandler  : Stopped o.s.b.c.e.j.JettyEmbeddedWebAppContext@50d0686{/,[file:///tmp/jetty-docbase.3963833647300409511.8080/],UNAVAILABLE}
{% endhighlight %}

And that's the crucial part. In the best case scenario, the problems will only lay in long waiting time for the container to stop. But in worst case scenario, if the application doesn't free any used resources (like database connections, locks etc.)... yeah, you can imagine the consequences. 

I spotted similair issues when working with k8s as the container orchestrator. And whis is something which is fully understandable. The container in the pod tries to handle the `SIGTERM` signal, and if it doesn't, the orchestrator will `SIGKILL` it.  

### Extra part
In my current project we use, amongst others, [Sbt](https://www.scala-sbt.org/). It has its own plugin for creating docker images - [sbt-native-packager](https://www.scala-sbt.org/sbt-native-packager/formats/docker.html), please be careful when choosing `Cmd` over `ExecCmd` :D.

I'm curious about, What other things are commonly overlooked while using docker? If you have an example, just comment or send an email.

## Links
- [Docker](https://docker.com)
- [https://stackoverflow.com/questions/42805750/dockerfile-cmd-shell-versus-exec-form](https://stackoverflow.com/questions/42805750/dockerfile-cmd-shell-versus-exec-form)
- [https://stackoverflow.com/questions/47904974/what-are-shell-form-and-exec-form?rq=1](https://stackoverflow.com/questions/47904974/what-are-shell-form-and-exec-form?rq=1)
- [http://goinbigdata.com/docker-run-vs-cmd-vs-entrypoint/](http://goinbigdata.com/docker-run-vs-cmd-vs-entrypoint/)