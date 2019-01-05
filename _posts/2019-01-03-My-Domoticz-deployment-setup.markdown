---
layout: post
title: My Domoticz deployment setup
date: 2019-01-03
description: How do I tackle domoticz deployment at home
category: blog
tag:
- linux
- domoticz
- home automation
- docker
- ansible
- raspberrypi
- rpi
comments: true
---

> Disclaimer. I am using home automation software and hardware at home. But that's not the only way for me to control my appliances. I always make sure that in the case of any home automation failure I am still able to manually control them.

Everyone interested in some home automation projects surely stumbled upon [Domoticz](https://www.domoticz.com) at some point. In general there are other solutions as well, but I won't describe them here. 

I'm using *Domoticz* more than two years now and I'd like to share in this post *how* do I currently manage hardware and software in the scope of my simple home automation. I'll also try to explain *why* my configuration is setup how it is. But before going into solutions, let me explain my requirements and reasons for them to exist. 

## What are my requirements?

- _**deployment automation**_ - as a developer, I like to have my deployments automated, so that it really requires *from-minimal-to-no-effort* from my side to deploy newer versions of software that I'm running. SSH into a remote Linux server to deploy newer versions is too time consuming and basically not an option.

- _**RPI hardware**_ - in recent years I gathered 5 Raspberry Pi's (B+; 2B; 2 x 3B; Zero) which I was (and sometimes still am) using for various purposes like home media center, hackathons, servers, routers, learning etc. They're placed together in rack case along with a NFS server in the attic. One could argue that I could place Domoticz on the server, but it already runs other software.
![RasperryPi Rack]({{ site.url }}/assets/rpis-rack.jpg)

- _**backup and high availability**_ - during my 2 years with Domoticz I tackled various problems. There were times, when I needed to configure fresh Domoticz (why? later on). I would like to minimize the risk of that. There were times, as well, when because of harwarde failure I was not able to control appliances at home. It's not a real issue but an inconvenience, so minimizing that risk is a goal as well. Furthermore, I want to be able to just remove one or two RPIs from time to time, because of other activities which I mentioned earlier.

## Deployment automation

There were times, when I was deploying (or I should rather say managing deployment) manually. Since the beginning, Domoticz at my home was running on a RPI, which made the process look more or less like this:
- ssh to the rpi
- backup the database (Domoticz uses [SQLite](https://www.sqlite.org/index.html))
- run `./update` scripts in domoticz package
- tackle issues (if needed)
- check if things are working

This process was maybe not that hard, however it made me remember couple of things like IP addresses, scripts to run and backups to create. In order to automate this process I decided for using [Docker](https://docker.com) images and [Docker Swarm](https://docs.docker.com/engine/swarm/) for easing up the process.

### Docker abstraction

I started with searching for an already existing image for *arm* architectures. I cannot remember if I found something useful, but I had some criterias like for example cyclic/periodic updates. I'm sure I haven't found any image which had this in place already. So I decided to use my doubtful skills to automatically create and publish a docker image for every newest published Domoticz version. With some help of [Travis CI](https://travis-ci.org/) I setup a simple [GitHub](https://github.com) repository - [gmaslowski/rpi-domoticz](https://github.com/gmaslowski/rpi-domoticz) (*post about building docker images with Travis CI can be found [here](https://gmaslowski.com/automating-your-docker-images-build-and-deploy-with-travis-ci/)*). The artifact which is produced from it (*always daily with newest Domoticz beta version, which is basically the current development and I think the only reasonable version to use*) is published to [DockerHub](https://hub.docker.com) registry - [gmaslowski/rpi-domoticz](https://hub.docker.com/r/gmaslowski/rpi-domoticz/). That makes it really convenient to use. By default, with little help of  Docker manifests, the image targets *arm* and *amd64* architectures. The image is the core prerequisite to use dockerized version of Domoticz, which can be run manually with `docker run`, `docker-compose` or deploy into Docker Swarm.

### Container orchestration

Having dockerized Domoticz, now came the time to deploy it. At home I run *Docker Swarm*. For some it might be an overhead, for some it might be weird to have a cluster at home... But I find it quite convenient to deploy software at home for purposes which I don't want to have in the cloud. For example, file storage like [Dropbox](https://www.dropbox.com) is too expensive (at least for me) and I try to avoid as much as possible storing private data, images, videos on the net. This makes me running [Nextcloud](https://nextcloud.com). Another good reason for running Swarm is that I work in IT. I like to, and I have to be somehow up to date with technology. At work in current project we switched from Docker Swarm to [Kubernetes](https://kubernetes.io/) already, so I find it convenient to run Docker Swarm at home.

Having a Docker Swarm cluster in place, and with some help of [GitLab](https://about.gitlab.com/) the configuration of the deployment looks like this:
{% highlight yaml %}
version: '3.7'

services:
 
  domoticz:
    image: gmaslowski/rpi-domoticz:4.1030
    command:  [
      "/domoticz/domoticz",
      "-www", "8080",
      "-dbase", "/domoticzdb/domoticz.db"
      ]
    volumes:
      - /etc/timezone:/etc/timezone:ro
      - /etc/localtime:/etc/localtime:ro
    deploy:
      replicas: 1
{% endhighlight %}

With `.gitlab-ci.yml`:
{% highlight yaml %}
stages:
  - software

.job_template: &home-job
  tags:
    - deployer
  only:
    - master
  when: always

software:
  <<: *home-job
  stage: software
  image: docker:18.09
  script:
    - docker stack deploy -c software/automation/automation.yml home
{% endhighlight %}

Here it can be seen that, updating my Domoticz deployment boils down to changing this line `image: gmaslowski/rpi-domoticz:4.1030` to use the chosen Docker image version and push the change to master. GitLabCi and Gitlab Runner will make sure that new version gets deployed.

And that covers the topic of deployment automation. 

## Hardware placement and restrictions

As stated previously I have some RPIs which I'd like to use to run Domoticz. Basically what do I need? RPIs I already have, so the thing missing is making sure that the configuration (docker installed, user management etc.) is the same (or really similar) on every RPI and other hardware in the cluster. Additionally I'd like to avoid as much as possible any manual actions which require from me remembering any configurations. A fairly good example of that would be my router and AP configurations, when I really messed up a lot when after a factory upgrade my AP needed replacement. Because of no configuration stored anywhere but the AP I needed to recreate many settings (WiFi, accesses, QoS) from my head. A good point would be to automate that configuration and make applying it idempotent - I'm working on that and I think it can be a good option for another post. Let's get back to the main topic.

### Attic
The hardware runs in the attic. I have the tendency to keep my travelling ;) there limited as much as possible. I wan't to be able to (to some extent) manage my hardware remotely. Of course, it's not possible to fix a physical error remotely, but removing the need to have a physical access to hardware is the goal.

### Ansible configuration
> Before any more description, I'd like to made I thing clear, even for myself. For me it's not about using Ansible - for me it's about having *infrastructure/configuration-as-a-code* approach.

My tool of choice for the time beeing is [Ansible](https://ansible.com). Why? Again, I'm in IT :D and:
- Ansible is one of the standards used in industry
- Ansible doesn't require any process running on the RPIs - everything is done over SSH
- it allows me to setup my RPIs and servers to a required stage really fast
- and of course automation and learning are one of my key goals

I will not put all of my ansible configurations here, because the number of them is growing with every day - so much fun :). I will focus on what I configure with it:
- users, groups and accesses - I make sure that every piece of hardware I run at home has some preconfigured user with SSH keys so I don't need to care about remembering passwords (with the exception of a specific user for normal keyboard/monitor access in case of weird troubleshooting - my hardware are not VMs)
- basic software i.e.: vim, nettools and docker. Did you spot the problem already? I'll elaborate more on that in the *what's missing* section.
- NFS configuration - more on that in *HA* section
- Timezones - to be consistent when going through logs
- Hostnames - to have consistent naming across my home LAN

## High Availability

It happened to me couple of times that my home automation software was not fully working. The reasons were various. Let me enumerate them:
- one of the AP gone - most of the devices I control are connected to WiFi and as soon as the AP was gone theye were unable to connect to it. I cannot replace an AP in a second, but I can make sure that the process of it is as painless as possible. It's not just replacing an AP device, it is its configuration which makes it take longer.
- RPI freezes or doesn't start after power outage - it's not that common, but happened 2-3 times during the last year.
- SD card failures - causing RPI not to start, so the issue is similar - happened to me once
- corrupted Domoticz SQLite database file - happened to me once 

### RPIs
In my experience, relying on one RPI for running Domoticz is not the way to go. Not only because of occasional failures, but also sometimes I'd like to detach a RPI from the cluster and use it for something else. So I already have 4 of them being able to run (amongst others) Domoticz. The only thing I need to make sure is that Docker Swarm places `domoticz service` only on them. That's easy as applying a label onto each RPI Docker node i.e.: `rpi=true`:

{% highlight bash %}
greg@pc001:~|⇒  docker node ls -q | xargs docker node inspect -f '{{ .ID }} [{{ .Description.Hostname }}]: {{ .Spec.Labels }}'
ljvzdp36900i75poqgxww5bic [rpi001]: map[rpi:true]
qtrmc85j1dvw9w6jh7d1mlyn1 [rpi002]: map[rpi:true]
quu4g00qb669bxe3ols5jtuo5 [rpi003]: map[rpi:true]
al2orpsz28n0wnky2xxaa4tps [rpi004]: map[rpi:true]
{% endhighlight %}

And then configure the placement in the `domoticz service` docker descriptor file:
{% highlight yaml %}
domoticz:
  image: gmaslowski/rpi-domoticz:4.1030
  command:  [
    "/domoticz/domoticz",
    "-www", "8080",
    "-dbase", "/domoticzdb/domoticz.db"
    ]
  volumes:
    - /etc/timezone:/etc/timezone:ro
    - /etc/localtime:/etc/localtime:ro
  deploy:
    replicas: 1
    placement:
      constraints:
        - node.labels.rpi == true
{% endhighlight %}

### Storage
Remember that Ansible configured NFS? That's good :). Docker has the option to mount a volume from a defined NFS storage. And that solves my storage availability problem. I have a server with mirrored disks for storing my private data. Additionally for the purpose of running Domoticz I setup a NFS on it (with Ansible of course). So now I don't need to worry on which of the RPIs Domoticz starts - it will always use the same storage hence the same database. No need to synchronize or to copy data. How cool is that?

Here is the full snippet of my Domoticz deployment descriptor with NFS attached volume:
{% highlight yaml %}
version: '3.7'

services:
 
  domoticz:
    image: gmaslowski/rpi-domoticz:4.1030
    command:  [
      "/domoticz/domoticz",
      "-www", "8080",
      "-dbase", "/domoticzdb/domoticz.db"
      ]
    volumes:
      - nfsdb:/domoticzdb/
      - nfsscripts:/domoticz/scripts/
      - /etc/timezone:/etc/timezone:ro
      - /etc/localtime:/etc/localtime:ro
    deploy:
      replicas: 1
      placement:
        constraints:
          - node.labels.rpi == true
                                           
volumes:
  nfsdb:
    driver: local
    driver_opts:
      type: nfs
      o: addr=<nfs.ip>,nolock,rw
      device: ":/path/to/domoticzdb"
  nfsscripts:
    driver: local
    driver_opts:
      type: nfs
      o: addr=<nfs.ip>,nolock,rw
      device: ":/path/to/domoticz/scripts"
{% endhighlight %}

Besides I can remove (for other purposes) up too 3 RPIs from the cluster and still be sure that my home automation works. Yay! 

## Recap
Let's try to summarize this post in one sentence.

>> I automatically deploy Domoticz in an easily recoverable RPI cluster with external RAID-1 storage.

Wow. That's a really short TL;DR version. To visualize a little bit of what I was describing please have a look at this picture: 
![Deployment Setup]({{ site.url }}/assets/rpi-domoticz.jpg)


## What's still missing?
- **How to tackle NFS failures?** - So my NFS runs also in the attic on a server. The backup is in place because of the RAID-1 configured disks. But if the server fails, I'll not be able to use Domoticz. So I'm wondering how to tackle this problem, or do I really need to tackle it? I can live with couple of days without home automation to replace the broken part and to recreate the server setup. Another option would be to use [Flocker](https://github.com/ClusterHQ/flocker). 
- **How to bind USB devices to Swarm Services?** - I have couple of devices on 433MHz and 886Mhz radio. But in order to make it work I have USB connected transcievers. And that's the problems. Actually two of them which I still haven't work out. One of the problems is that the transcievers are connected physically to a RPI and Domoticz uses the USB. So I'd need to figure something out to be able to deploy Domoticz on other RPI and still be able to use that. Or just live with the limited functionality whenever this RPI is down for some reason. I'm started to be paranoid :D with all the HA idea :P. The second problem is that for a Swarm Service it is still not possible to use USB. There are workarounds though, more on that -> [https://github.com/docker/swarmkit/issues/1244](https://github.com/docker/swarmkit/issues/1244)
- **Database backup** - one could saym that I already have a backup with the mirrored disks. Not really. If a corruption of the database is considered than I basically still need to reconfigure the DB. However, not all is lost. Currently I'm working on a Docker CRON solution to backup the Domoticz database every day or so, and with Docker that should be quite easy.  
- **Egg and Chicken -> Docker vs Ansible** - I run into this problem with still not clear solution. Let me explain. I run my Ansible idempotent tasks with GitLab CI Docker Runner. So obviously for running Ansible scripts I need Docker runtime :). So it doesn't make sense to install Docker with Ansible - at least on the node on which the Runner runs. There's still little manual action needed as it comes to the whole configuration. But this one I think I'll leave. But that doesn't imply that I cannot install docker on other devices from Ansible, so partially it still makes sense. There are solutions like [Ansible Tower](https://www.ansible.com/products/tower) and I would need some time to grasp this as well.
- **Static IP addresses maintained by Ansible** - I already mentioned the issue I had with replacing the AP. My Router and AP both run [DD-WRT](https://dd-wrt.com/) software/firmware. I recently found out that with `nvram` command tool it is possible to change any DD-WRT device settings - the same as you have with GUI. So a obvious next step for me would be to place the configuration with static IP leases, WiFi settings etc.. into the code. In this way I could sleep better having in mind that even a Router or AP failure would be easily resolvable. I could of course us the option of configuration backup of DD-WRT, but those to my knowledge will work only with the same DD-WRT version on the same hardware. And with my Ansible approach I would at least have that in code - which is easily understood in contrast to binary files.
- **Docker Swarm masters** - Not really sure if that's an issue, but at least it is something I need to keep in mind to verify. I have 5 devices in the Docker Swarm cluster. I wanted to make sure that if one of the devices fail I can still manage the cluster, so I needed to make 3 of them masters. Why 3 and not 2? Well, Docker Swarm requires majority of masters to be present [(n+1)/2], in order to work. So 2 of my RPIs became masters, I need to remember never to detach those two :).

I'm curious how people in generally deal with Domoticz, or any Home Automation solutions deployment, so that they keep working constantly. Do people care about HA, or just tackle failures whenever they appear?

## Links
- [Domoticz](https://domoticz.com)
- [Docker Swarm](https://docker.com)
- [Ansible](https://ansible.com)
- [https://github.com/docker/swarmkit/issues/1244](https://github.com/docker/swarmkit/issues/1244)
