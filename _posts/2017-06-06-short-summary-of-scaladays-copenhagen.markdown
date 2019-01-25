---
layout: post
title: Short summary of Scaladays Copenhagen 2017
date: 2017-06-06
description: Some information about Scaladays which took place in Copenhagen at the end of May 2017.
tag:
- scala
- conference
- akka
- programming
author: gregmaslowski
category: blog
comments: true
image: assets/scala_1.jpg
---

Recently I have attended the [Scaladays](http://event.scaladays.org/scaladays-cph-2017) conference which took place at 31.05.2017 - 02.06.2017 in Copenhagen. During my 
professional career I've took part in several conferences in Poland, mostly concerned the Java ecosystem. So Scaladays was my first conference regarding Scala.
I must say that I'm not a Scala guru nor expert - I was working professionally only with one Scala based project. On the contrary I've also worked with Akka and Spark, but with 
Java language. I'm also trying to use Scala with Akka for side projects. In this post I'd like to give a short summary of couple of talks I've attended during the conference.

## 8 Akka anti-patterns you'd better be aware of // Manuel Bernhardt [@elmanu](https://twitter.com/elmanu)

Manuel gathered couple of Akka antipatterns he came across during his professional work. He mentioned quite obvious issues like global mutable state, 
flat actor hierarchy, blocking, re-inventing akka tools and Java serialization. On the other hand, Manuel pointed out that teams are not paying attention on what hardware
does our software run. We're living in times where hardware is so much abstracted, that we really need to pay attention how much resources are actually available to our
applications - we have hardware, on top which we have virtual machines, on top of which we have dockerized containers, on top of which we have JVM, on top of which 
we build our system :). I think it's best described by this:

>
> Hardware tries to make software faster;
> Software tries to make hardware slower;
>

The talk was in the itermediate track. Well, from my point of view it could be a better fit for beginner track. Nevertheless, the talk was good and entertaining, 
mixed with couple of brilliant fitting quotes to each of the antipattern. 

You can find the slides here: [https://www.slideshare.net/ManuelBernhardt/scala-days-copenhagen-8-akka-antipatterns-youd-better-be-aware-of](https://www.slideshare.net/ManuelBernhardt/scala-days-copenhagen-8-akka-antipatterns-youd-better-be-aware-of)

## The best is yet to come - State of Akka in 2017 // Konrad Malawski [@ktosopl](https://twitter.com/ktosopl)

I think this talk deserved to be a keynote of Scaladays. Konrad made it to compress the whole(?) history of Akka development in a ~200-pages (:D) presentation.
During his talk, I think he touched all of the Akka programming aspects and presented it on a journey map: 

![Akka journey](https://pbs.twimg.com/media/DBjHXCyWsAAwudP.jpg){:width="600px"} 

Konrads talk was so much packed with compressed and valuable content, that you generally feel like the presentation contained all information you'd ever need while
diving into Akka :). 

Slides are available here: [https://www.slideshare.net/ktoso/state-of-akka-2017-the-best-is-yet-to-come](https://www.slideshare.net/ktoso/state-of-akka-2017-the-best-is-yet-to-come)

## Event Sourcing and CQRS // Lutz Huehnken [@lutzhuehnken](https://twitter.com/lutzhuehnken)

The talk consisted of presentation and some live demos. Lutz was explaining firstly Event Sourcing with the 
usage of [Lightbends](https://www.lightbend.com/) new framework: [Lagom](https://www.lightbend.com/platform/development/lagom-framework), 
and then with simple projection to MySQL he showed the ideas behind CQRS. 

What is really nice about Lagom, is that in development mode, you get Cassandra and Kafka up and running to demo or test your project. This feature was
unfortunatelly not described by Lutz during his talk.

The project can be found here: [https://github.com/reactivesystems-eu/eventsourcing-intro](https://github.com/reactivesystems-eu/eventsourcing-intro)

## Little bit of fun

### Scala
During the conference we had also the possibility to meet among others Martin Odersky and Bill Venners. So that's how I got into posession 
of "Programming in Scala" copy with their inscription :). What's more.. a picture booth would also be a nice idea :D. Many conference attendees (including myself)
took pictures with them.

![Programming in Scala]({{ site.url }}/assets/scala_1.jpg)
![Greg, Martin Odersky and Bill Venners]({{ site.url }}/assets/scala_2.jpg)


### Rubik's Cube
As normally on a conference there were booths :). One of it was a stand from [Sygnify Technology](https://www.signifytechnology.com/) - they've hosted a 
Rubik's Cube challenge. Happily for me to announce, I made it to the finals which took place on the stage during the Prize Draw. The prize was good, as you could win
a DJI drone. Unfortunately I wasn't that fast :). Follow for more information: [https://www.signifytechnology.com/blog/2017/06/rubik-challenge-winner-is-dot-dot-dot](https://www.signifytechnology.com/blog/2017/06/rubik-challenge-winner-is-dot-dot-dot)

### Oculus Rift and Project Cars
Since I'm a fan of Formula1 and a weekend car-simulator gamer, a stand hosted by ING with Playseat, Oculus Rift and Project Cars didn't go unnoticed :). It is
really a slightly different experience driving with the goggles on. At least now I know what will be the next extension of my gaming setup :).

## Summary
In short words: the conference was great. The talks were literally packed with knowledge and experience. Everyone, regardless their Scala expertise or knowledge, could find 
something for him on beginner, intermediate or advanced tracks. Having also the possibility to exchange ideas, solutions and knowledge with other professionals makes this
conference a must-attend next year!

## Links
- [http://event.scaladays.org/scaladays-cph-2017](http://event.scaladays.org/scaladays-cph-2017)
