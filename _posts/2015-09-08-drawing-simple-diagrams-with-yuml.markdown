---
layout: post
comments: true
title: Drawing simple diagrams with yUml
date: 2015-09-08
description: yUml - free online diagram generator
---

Lately I was starting yet another project for learning/fun purposes. Since recently I'm a big fan of 
[Scala](http://www.scala-lang.org) and [Akka](http://akka.io/) there's no secret I decided to start 
[distractor](http://github.com/gmaslowski/distractor) using them. The project is based upon [reactor](https://github.com/FutureProcessing/reactor) 
and it's aim is to allow distribution of transports and reactors across multiple nodes/JVMs.

So, there I was, with a started project, with already some code committed. What I wanted to do next was to somehow 
document the architecture of the underlying actor model. I didn't want to use any sort of visual diagram generators, since
I don't like the drawback of being forced to maintain multiple file versions of created diagram or to export the jpg/png/svg
file to include it into wiki.

So while searching the depths of internet I've come across [yUml](http://yuml.me/). It turned out to be great for my needs.
It allows creation of simple diagrams from plain text! For me it's great, since I can simply write such diagram and put 
it into code repository. That's it. 

## Possibilities
So let's quickly evaluate the possibilities which are given by this tool. So far with yUml everyone is able to create 
three types of diagrams: class, activity, use case. So far I only needed to create something which could demonstrate my 
actor architecture. So obviously the class diagram suited me the most.

So lets examine some easy class diagram:
{% highlight ruby %}
[Customer|-forname:string;surname:string|doShiz()]<>->[Order]
[Order]++-0..*>[LineItem]
[Order]-[note:Aggregate root{bg:wheat}]
{% endhighlight %}

 What we can expect from the output image? So there should be:
 
- a *Customer* entity
    - with forname, surname fields
    - with doShiz() method
- a *Order* entity
    - which is a composite of Customer
    - with a colored note
- a *LineItem* entity
    - which is an aggregate of *Order*
    - with zero to many mapping

So lets take a brief look at the result:

![Diagram](http://yuml.me/diagram/scruffy/class/[Customer|-forname:string;surname:string|doShiz()]<>-orders*>[Order],[Order]++-0..*>[LineItem],[Order]-[note:Aggregate root{bg:wheat}])
.

Yay!. That's what it is all about. It's also easy to include into markdown:

{% highlight ruby %}
![Diagram](http://yuml.me/diagram/scruffy/class/[Customer|-forname:string;surname:string|doShiz()]<>-orders*>[Order],[Order]++-0..*>[LineItem],[Order]-[note:Aggregate root{bg:wheat}])
{% endhighlight %}

 More examples can be found here:
 
- [class diagram](http://yuml.me/diagram/scruffy/class/samples)
- [activity diagram](http://yuml.me/diagram/scruffy/activity/samples)
- [use case diagram](http://yuml.me/diagram/scruffy/usecase/samples)

## Outcome for my project
After playing a little bit with yUml, I've achieved a diagram which was currently matching the actor system architecture. 
Of course it's not a class diagram per se, since Actor modelling in Akka is different than writing imperative code. However
class diagram served me good for the goal I was trying to achieve. From the diagram, it's easy to see how the actors
are structured in my application.

![Actor System Overview](http://yuml.me/diagram/scruffy/class/[note:Distractor ActorSystem {bg:wheat}],[Distractor {bg:lightskyblue}]++-1>[ReactorRegistry {bg:lightskyblue}],[Distractor {bg:lightskyblue}]++-1>[ReactorTransportMixer {bg:lightskyblue}],[Distractor {bg:lightskyblue}]++-1>[TransportRegistry {bg:lightskyblue}],[TransportRegistry {bg:lightskyblue}]<>-0..*>[*Transport {bg:lightsalmon}],[ReactorRegistry {bg:lightskyblue}]<>-0..*>[*Reactor {bg:lightsalmon}])

## Drawbacks
Of course as to all tools, there are some compromises. What I've found most disturbing was the fact, that 
referencing entities with additionals (colors, fields or others) doesn't work if the entity isn't placed with them
every time it is referenced. So I can imagine that creating more complex diagrams could be a pain.

So hence, one conclusion for yUml is that it could be a perfect tool for creating small and quick documentation for 
our code. If someone would like to create a heavy code documentation out of it - no.. don't do it.

One thing to mention here is that the tool is free of charge so far. However I have seen pro-account link on the yUml
page. Didn't click though. 

## Links
- [yUml](http://yuml.me/)
- [scruffy](https://github.com/aivarsk/scruffy)
- [scruffy-server](https://github.com/wernight/scruffy-server)
