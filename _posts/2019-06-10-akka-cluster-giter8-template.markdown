---
layout: post
title: "Akka Cluster Giter8 template."
date: 2019-06-10
description: Easing the pain of fast prototyping.
category: blog
tag:
- akka
- giter8
- akka cluster
- prototyping
comments: true
---

Couple of times already I've found myself in a situation that I wanted to prototype something based on Akka Cluster. In order to do that I was almost always reviewing the [Akka Cluster Usage Sample](https://doc.akka.io/docs/akka/2.5.5/scala/cluster-usage.html#a-simple-cluster-example) and downloading the sample, or have used one of my already created examples. The problem with that approach is that all of the samples already have code and configuration in it. Mostly, with new prototypes, I don't need package names, configurations and snippets of code remaning from other prototypes..

So this time, when I wanted to prototype an actor based PubSub dispatching mechanism on Akka Cluster, I decided to finally extract a template for that, so it doesn't take half an hour to get a cluster running locally.

## Giter8 templates

There's a nice project called [Giter8](http://www.foundweekends.org/giter8/) created exactly for such cases. I've stumbled upon it already some years ago. But never had the chance/need to actually create a template myself. So.. I started :).

## Akka Cluster base project

For my new scaffold/template project I had minimal requirements:

- project has to be akka cluster based
- akka cluster should be configured right from the start, so that no code change is required to setup a working cluster
- it has to start the cluster locally, thus enabling prototyping really fast without the need for extra configuration

### Enabling Akka Cluster

This is quite easy to achieve, proper library dependencies have to be added to the project:

{% highlight scala %}
libraryDependencies ++= Seq(
  "com.typesafe.akka" %% "akka-actor" % akkaV,
  "com.typesafe.akka" %% "akka-slf4j" % akkaV,
  "com.typesafe.akka" %% "akka-cluster" % akkaV,
  "ch.qos.logback" % "logback-classic" % logbackV,
)
{% endhighlight %}

Additionally I've already added logging component, as it comes quite handy with my logback configuration I use almost everywhere.

### Making sure Akka Cluster is configured

That's also mostly quite easy, as [Akka Cluster Documentation](https://doc.akka.io/docs/akka/2.5.12/cluster-usage.html?language=scala) describes it quite good. But nevertheless some configuration is needed:

{% highlight scala %}
akka {

  loggers = ["akka.event.slf4j.Slf4jLogger"]
  loglevel = "INFO"
  logging-filter = "akka.event.slf4j.Slf4jLoggingFilter"

  actor {
    debug {
      lifecycle = off
      receive = off
      autoreceive = off
    }
    provider = "cluster"
  }

  remote {
    log-remote-lifecycle-events = off
    netty.tcp {
      hostname = "127.0.0.1"
      port = 0
    }
  }

  cluster {
    seed-nodes = [
      "akka.tcp://actorSystem@127.0.0.1:2552",
      "akka.tcp://actorSystem@127.0.0.1:2553"]

    auto-down-unreachable-after = 10s
    jmx.multi-mbeans-in-same-jvm = on
  }
}
{% endhighlight %}

### Starting the cluster locally

Starting multiple actor systems locally, that form a cluster is also trivial (it's also shown somewhere in the Akka Cluster Example). How it's basically achieved? Well, in one JVM (one `main` method) multiple akka nodes are being started, which join the cluster (due to the shared configuration, pointing to local seed nodes). The imported main parts of such project:

---

`ExampleClusterApp.scala` - is the wrapper main App starting multiple applications:

{% highlight scala %}
package com.gmaslowski.example

object ExampleClusterApp
  extends App {

  ExampleApp.main(Seq("2552").toArray)
  ExampleApp.main(Seq("2553").toArray)
  ExampleApp.main(Seq("2554").toArray)
}
{% endhighlight %}

---

`ExampleApp.scala` - is the actuall main App starting the Akka Cluster:

{% highlight scala %}
package com.gmaslowski.example

import akka.actor.ActorSystem
import akka.cluster.Cluster
import com.typesafe.config.ConfigFactory

object ExampleApp
  extends App
    with AkkaComponents.Default // provides general configuration traits
    with AkkaClusterComponents.Default // provides general configuration traits for Akka Cluster
    with ExampleComponents.Default { // provides custom components

  val port = if (args.isEmpty) "0" else args(0)
  val config = ConfigFactory
    .parseString(s"akka.remote.netty.tcp.port=$port")
    .withFallback(ConfigFactory.load())

  override val actorSystem = ActorSystem("actorSystem", config)
  override val cluster = Cluster(actorSystem)

  initExampleComponents
}
{% endhighlight %}

- `.parseString(s"akka.remote.netty.tcp.port=$port")` - substitutes the Akka Remoting port with provided value

---

`build.sbt` - making sure that `run` invokes the wrapper App:

{% highlight scala %}
mainClass in(Compile, run) := Some("com.gmaslowski.example.ExampleClusterApp")
{% endhighlight %}

---

`application.conf` - couple of helping settings:

- `akka.remote.netty.tcp.port = 0` - would be random by default, but gets overriden anyway
- `akka.cluster.jmx.multi-mbeans-in-same-jvm` - informs Akka, that there are multiple clusters in one JVM

---

`ClusterListener.scala` - also taken from the Akka Cluster Example to see/notify about the cluster events:

{% highlight scala %}
package com.gmaslowski.example

import akka.actor.{Actor, ActorLogging, Props}
import akka.cluster.Cluster
import akka.cluster.ClusterEvent._

object ClusterListener {
  def props = Props(classOf[ClusterListener])
}

class ClusterListener
  extends Actor
    with ActorLogging {

  val cluster = Cluster(context.system)

  override def preStart(): Unit = {
    cluster.subscribe(self, initialStateMode = InitialStateAsEvents, classOf[MemberEvent], classOf[UnreachableMember])
  }
  override def postStop(): Unit = cluster.unsubscribe(self)

  def receive = {
    case MemberUp(member) =>
      log.info("Member is Up: {}", member.address)
    case UnreachableMember(member) =>
      log.info("Member detected as unreachable: {}", member)
    case MemberRemoved(member, previousStatus) =>
      log.info("Member is Removed: {} after {}", member.address, previousStatus)
    case _: MemberEvent => // ignore
  }
}
{% endhighlight %}

And that was all there is to the simple Akka Cluster App. Now it needs to be made available as a Giter8 template.

## Gitering the solution

The documentation available at [http://www.foundweekends.org/giter8/template.html](http://www.foundweekends.org/giter8/template.html) describes quite well, how such templates are supposed to be created. In this case I'll just limit myself to show the g8 project structure and list some gotchas I've came across.

---

Giter8 `default.properties`:

{% highlight bash %}
name=Example
package=com.example
description=Example Akka Cluster App.

systemname=$name;format="normalize"$
classname=$name;format="Camel"$

verbatim = *.xml
{% endhighlight %}

This file will be used, as configuration, by Giter8 during the scaffold/generation process. The variables are being then used for substitution in the project template.

---

Project directory structure:

{% highlight bash %}
rock-solid λ ~/devenv/private/akka-cluster.g8/ master tree         
.
├── README.md
└── src
    └── main
        └── g8
            ├── build.sbt
            ├── default.properties
            ├── project
            │   └── plugins.sbt
            └── src
                └── main
                    ├── resources
                    │   ├── application.conf
                    │   └── logback.xml
                    └── scala
                        └── $package$
                            ├── $classname$App.scala
                            ├── $classname$ClusterApp.scala
                            ├── $classname$Components.scala
                            ├── AkkaClusterComponents.scala
                            ├── AkkaComponents.scala
                            └── ClusterListener.scala

9 directories, 12 files
rock-solid λ ~/devenv/private/akka-cluster.g8/ master 
{% endhighlight %}

- all of template project files, by convention, should be placed either into `src/main/g8` or `./` directory. 
- the `default.properties` files contains variables which will be substituted during project scaffolding/generation; 
  - `$package$` - will be expanded into directories defined by the package name
  - `$classname$` - name of classes, coming directly from the project name - that is sufficient for the fast prototyping needs
- inside `default.properties` file default values are residing, so that it's not needed to provide them at all

---

One of the source files:

{% highlight scala %}
package $package$

import akka.actor.ActorSystem
import akka.cluster.Cluster
import com.typesafe.config.ConfigFactory

object $classname$App
  extends App
    with AkkaComponents.Default
    with AkkaClusterComponents.Default
    with $classname$Components.Default {

  val port = if (args.isEmpty) "0" else args(0)
  val config = ConfigFactory
    .parseString("akka.remote.netty.tcp.port=" + port)
    .withFallback(ConfigFactory.load())

  override val actorSystem = ActorSystem("$systemname$", config)
  override val cluster = Cluster(actorSystem)

  init$classname$Components
}
{% endhighlight %}

### Gotchas:

- I had issues while trying to use Scala string interpolation like this `s"$variable"` - the Giter8 processor (because of `$`) tried to use `$variable` as something to replace; I fixed the issue by switching to `"" + variable` notation; not really sophisticated, but does the job ;); I did not search for a solution though
- `verbatim=*.xml` was added becasue the `logback.xml` file contains a `${CONSOLE_LOG_PATTERN}` entry, which again is not parsed by Giter8 properly

### Example run

Now it is really easy to scaffold a basic, working Akka Cluster application by simply executing `sbt`:

{% highlight bash %}
sbt new gmaslowski/akka-cluster.g8
{% endhighlight %}

Since a picture is worth more, than tousands of words:

<script src="https://asciinema.org/a/250761.js" id="asciicast-250761" async data-autoplay="true" data-size="medium" data-speed="2.5" data-theme="solarized-dark"></script>

## Enhancements

I already have some ideas of what I could change and benefit from it:

- adding Revolver Plugin for sbt, so that sbt doesn't get blocked by the running nodes
- adding Docker/Docker Swarm template for deploying locally
- adding Kubernetes template, for deploying to a locally running Minikube cluster


## Links

- [Giter8](http://www.foundweekends.org/giter8/template.html)
- [Akka Cluster Usage](https://doc.akka.io/docs/akka/2.5.12/cluster-usage.html?language=scala)
- [https://github.com/gmaslowski/akka-cluster.g8](https://github.com/gmaslowski/akka-cluster.g8)
- [https://asciinema.org/a/250761?speed=2.5&theme=solarized-dark&size=medium](https://asciinema.org/a/250761?speed=2.5&theme=solarized-dark&size=medium)
- [Asciinema](https://asciinema.org/)