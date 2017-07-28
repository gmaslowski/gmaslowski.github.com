---
layout: post
title: Selenium headless testing with docker on linux
date: 2017-04-20
description: How to organize your GUI tests without Windows machines.
comments: true
---

In previous projects I was working on, most of the times the QA people from the team were responsible for organizing and setting up e2e testing. I never gave it too much thought - and most of the time we've cconfigured Jenkins slave which we set up on Windows host. The main reason behind such approach was that Windows is generally GUI and I have never thought of it to be possible to have a headless GUI session on linux.

But let me just describe what's the most common setup we've had in projects. Applications were mostly Java based. E2E tests (I should rather say - GUI tests, since in big integration projects the word e2e can have really many meanings) were also written in Java, supported by [Selenium](http://www.seleniumhq.org/) and/or [Selenide](http://selenide.org/). For tests execution we used common build tools like [Maven](https://maven.apache.org/) or [Gradle](https://gradle.org/). As already pointed out we wanted to execute those tests against a browser. We knew about phantomJS, htmlUnit and other headless testing drivers, but actually we never wanted to use them because of dynamic nature of SPA applications. There was also [Selenium Grid](http://www.seleniumhq.org/projects/grid/) which we considered, but actually... Well - I think that having already a windows-host we didn't investigate too much.

Recently, in another project a team wanted to run their suite of GUI tests with the same configuration. So, being somehow involved into the discussions, I proposed the solution which I knew. But then actually one person on the team was complaining that running those without Windows based host would be better, besides that getting a Windows host machine turned out to be kinda problematic. So I've set a goal to investigate how could it be possible to run GUI tests (Java, Selenium and Chrome/Firefox based) on linux machines. 

## Introducing xvfb
My research quickly pointed me to xvfb which is a virtual X11 display server. As the [wiki](https://en.wikipedia.org/wiki/Xvfb) explains:

> Xvfb or X virtual framebuffer is a display server implementing the X11 display server protocol. In contrast to other display servers, Xvfb performs all graphical operations in memory without showing any screen output. From the point of view of the client, it acts exactly like any other X display server, serving requests and sending events and errors as appropriate. However, no output is shown. This virtual server does not require the computer it is running on to have a screen or any input device.
>
> [https://en.wikipedia.org/wiki/Xvfb](https://en.wikipedia.org/wiki/Xvfb)

With xvfb you can run your headless gui using maven like that:
{% highligh bash %}
Xvfb :10 &
export DISPLAY=:10
mvn test
{% endhighlight %}

In this approach we start xvfb in background with defined display number. In order to get it all working we need to set DISPLAY env variable to the same display number. Then just execute the needed script. But there's another way, which personally I find more convenient. 
{% highlight bash %}
xvfb-run mvn test
{% endhighlight %}

The benefits don't need comments:
- xvfb runs only for the time of execution of the tests
- no need of exporting any env variables
- with ```xvfb-run -a``` it's possible to enable concurrent builds

With that knowledge we created such configuration on Jenkins, which didn't need another Windows based host to run GUI tests. But as of doing that, I wondered, why not dockerize it? - So actually it won't be needed to maintain system dependencies (firefox, xvfb) on the host machine. Thus it woule be made easy to run (without installation) on any machine, not only Jenkins.

## Creating a base docker image runner

Docker :). The life saver and pain in the ass of all devops. We already know that conterization doesn't come for free. In jvm world, it gets even harder as Java needs to be compiled before using. But, nevertheless it would be useful in the testing case. Let's define a basic image:

{% highlight docker %}

{% endhighligh %}

Please not that, this is just a simple example. Normally you'd like to cache Maven or Gradle dependencies, by mounting your local ```.m2``` or ```.gradle folder```. For acquiring screenshots it would be also beneficial to mount a directory. But short description of what's actually configured here. We use debian as base image, install jdk, 

## Executing tests

## Next steps?

## Links
- code from the post: [https://github.com/gmaslowski/headless-selenium-testing](https://github.com/gmaslowski/headless-selenium-testing)
- [https://chromium.googlesource.com/chromium/src/+/lkgr/headless/README.md](https://chromium.googlesource.com/chromium/src/+/lkgr/headless/README.md) - headless chrome ;)

## Conclusion

