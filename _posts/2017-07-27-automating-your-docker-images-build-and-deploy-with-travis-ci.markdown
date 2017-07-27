---
layout: post
title: Automating your docker images build and deploy with Travis CI
date: 2017-07-27
description: A simple explanation of how I've set up automatic builds of my docker images.
comments: true
---

A while ago, during one of the projects I was working on, I decided to build my/our/teams own docker image. The image was ought to contain only the needed 
parts for running the microservices we were building. The microservices where Java based, so we needed a base image with JVM. I cannot remember exactly what were the 
reasons for that decision, since we could use one of the already existing images. But hey, we're developers right :).

## History

As a [GitHub](https://github.com) fan I've created a new [repository](https://github.com/gmaslowski/docker-java) and put the Dockerfile there. I've started with a simple
image, based on [Alpine](https://alpinelinux.org/) linux. With Alpine, your resulting images will not be big, since [Alpine docker image](https://hub.docker.com/_/alpine/) is only couple of megabytes.
However it requires a little bit of effort, to install JDK there. But that can actually deserve another post. 

Going back, to the main topic. I started to build the images (whith newer JDK) and also maintaining the building and deploying. Simple as it was, I was mostly building and pushing the image to 
docker from my local pc/laptop. This might have not been the best solution, but it worked and got the job done. For some time at least. The majority of the problem was, that I haven't written any script
for it. I was just invoking docker shell commands. Believe me or not, but after some time of not using `docker build/tag/login/push` commands, it was not efficient anymore for me to release a 
new image. I thought, lets automate it as we automate almost everything in our project. Generally, I don't know why I haven't automated it in the first place. I think, that I became a 
victim of "it's good for now" and never convinced myself that it might be improved. Shame on me. So, little research and [Travis CI](https://travis-ci.org) looks like a possibility. 
It integrates with GitHub seamlessly and my other projects are also built with it.

## Travis CI configuration

The basic Travis configuration is actually pretty straightforward. You start with an indication, that the project is a docker project:
```
sudo: required

services:
  - docker
```

More documentation about how to use docker in build can be found here: [https://docs.travis-ci.com/user/docker/](https://docs.travis-ci.com/user/docker/). Then comes the actual building script which is
building the image:
```
script:
  - export TAG_JDK=gmaslowski/jdk:$TRAVIS_COMMIT
  - export TAG_JRE=gmaslowski/jre:$TRAVIS_COMMIT
  - docker run -it --rm -v "$(pwd)/jdk8/Dockerfile:/Dockerfile:ro" redcoolbeans/dockerlint
  - docker run -it --rm -v "$(pwd)/jre8/Dockerfile:/Dockerfile:ro" redcoolbeans/dockerlint
  - docker build ./jdk8 -t $TAG_JDK
  - docker build ./jre8 -t $TAG_JRE

```
Actually nothing spectacular is going on there. The commitId is used as a temporary tag/version of the image. Then the Dockerfile goes through some syntax checks thanks to the `redcoolbeans/dockerlint`
image. Then just the image is being built and tag with the commitId. One thing to notice here is that everything is done twice. That's, because of convenience reasons, I'm building the JDK and JRE images
in the same time. So far the configuration we have makes Travis verify and build the image on every commit for every branch and for every pull request submission.
That's cool also because GitHub and Travis integrate quite well. Every pull request has by default Travis checks enabled, so before merging I can actually see if the submitted changes actually work.

But hey, what about pushing to [Docker Hub](https://hub.docker.com/) repository - a place where everyone can host and share his public images? Well, in the beginning I've used the `after_success` section 
of Travis configuration and the script looked similar to this:
```
after_success:
  - export JDK_VERSION_MINOR=`cat jdk8/Dockerfile | grep "ENV JAVA_VERSION_MINOR" | awk '{print $3}'`
  - export JRE_VERSION_MINOR=`cat jre8/Dockerfile | grep "ENV JAVA_VERSION_MINOR" | awk '{print $3}'`
  - docker login -e $DOCKER_EMAIL -u $DOCKER_USER -p $DOCKER_PASS
  - docker tag $TAG_JDK gmaslowski/jdk:8 
  - docker tag $TAG_JDK gmaslowski/jdk:8u$JDK_VERSION_MINOR
  - docker tag $TAG_JDK gmaslowski/jdk:latest
  - test $TRAVIS_BRANCH = "master" && docker push gmaslowski/jdk:8
  - test $TRAVIS_BRANCH = "master" && docker push gmaslowski/jdk:8u$JDK_VERSION_MINOR
  - test $TRAVIS_BRANCH = "master" && docker push gmaslowski/jdk:latest
  - docker tag $TAG_JRE gmaslowski/jre:8 
  - docker tag $TAG_JRE gmaslowski/jre:8u$JRE_VERSION_MINOR
  - docker tag $TAG_JRE gmaslowski/jre:latest
  - test $TRAVIS_BRANCH = "master" && docker push gmaslowski/jre:8
  - test $TRAVIS_BRANCH = "master" && docker push gmaslowski/jre:8u$JRE_VERSION_MINOR
  - test $TRAVIS_BRANCH = "master" && docker push gmaslowski/jre:latest
```

Basically what is happening here is:

- take the JDK/JRE version from the Dockerfiles to tag images properly
- login to Docker H
- tag the built image with proper tag/version
- push the image to the hub if on master branch

You may wonder where do the `$DOCKER_*` env variables come from. Well, Travis provides a possibility to save secrets, so that they're available during the build, but not exposed in logs for examples.
A perfect solution for storing credentials in such cases. In the script, the last step is the crucial one. I didn't want to push images which were built from pull requests or individual branches.
I just want to push whenever changes were submitted, reviewed and checked. And it worked fine, for a while at least. Soon I've realized that for some reason (didn't investigate) pull 
request built images were being pushed to docker hub. Well, that's not something I wanted. So with a little fiddleling I've changed the configuration a bit,
by replacing `after_success` with `deploy` section:
```
deploy:
  skip_cleanup: true
  provider: script
  script: sh "./scripts/deploy.sh"
  on:
    branch: master
```

- `skip_cleanup` - will not remove artifacts after the build phase, so they can be available in deploy phase
- a script provider tells Travis that there's a script for deployment; note that as of writing this post it is in experimental state
- a path to the script; the deploy script contains the steps (with couple of changes) which were available previously in the `after_success` section
- and the most important part is that it should be only invoked while building the master branch

With such configuration, right now, my only job is only to change the Dockerfiles, submit a pull request, wait for the build to be green and than just merge the pull request. After that, in couple of
minutes my newly built images, with proper version will be available in the public Docker repository. However, it's not the end. The next steps I'd like to do is to automatically provide
a description for docker repository, so I don't have to maintain description in multiple places.

## Links

- source code [https://github.com/gmaslowski/docker-java](http://github.com/gmaslowski/docker-java)
- builds [https://travis-ci.org/gmaslowski/docker-java] (https://travis-ci.org/gmaslowski/docker-java)
- images on docker repository [https://hub.docker.com/r/gmaslowski/jdk/](https://hub.docker.com/r/gmaslowski/jdk/)
