---
layout: post
title: "Engineering verticals: how I stopped being the single point of failure"
date: 2026-06-18
description: How a 7-developer team running 160+ repositories handed every non-functional concern to its CTO by default, and the cross-cutting verticals we used to fix it.
category: blog
tag:
- engineering management
- architecture
- teams
- observability
- security
comments: true
---

Here is the shape of what I was responsible for, stated flat. Seven developers. More than 160 repositories. Three products in active use, one large platform behind them, one public API at [tenix.tech](https://tenix.tech), and around fifteen years of accumulated history, including four legacy products and six long-running projects. [Tenix](https://tenix.eu/) is an EV fleet charging platform: we run charging for electric bus and truck depots, somewhere around 6,000 vehicles a day and more than 350 million realtime events a month.

Seven people cannot each hold all of that in their heads, so they don't. Each developer owns the corner they work in, which is correct. But it leaves a category of work that belongs to no corner. Is this secure? Is it observable? Does the architecture still hold? Are we about to get a surprise bill? Every one of those questions ended up on my desk. Not because I claimed them, but because I was where they rolled when nobody else owned them. I was the single point of failure for everything non-functional, and the team was about to grow.

## Why feature teams leave a gap

We organise the way most teams do, around delivery. A developer or a small group owns a product area, a feature, a customer outcome. This is the [stream-aligned team](https://teamtopologies.com/) idea, and it is the right default: the people closest to the work make the calls about the work.

The trouble is that non-functional requirements do not respect those boundaries. Security, observability, architecture, infrastructure, cost: each one cuts across every team and belongs to none of them. So they fall to whoever feels the pain first. At our size, that was me.

What makes this dangerous is that the failure is quiet. Nothing pages you when an architecture slowly drifts out of shape, when a service stops being observable in the way you assumed, when a dependency goes stale. The charger looks healthy. The session looks healthy. The dashboards are green. The erosion is invisible right up until an incident makes it visible, and by then it is expensive.

Two real examples from our own estate: our platform [PostgreSQL](https://www.postgresql.org/) was sitting on version 11 as it approached end of life, and our [ingress controller](https://kubernetes.io/docs/concepts/services-networking/ingress-controllers/) was quietly deprecated upstream. Neither was any feature team's job. Both were everybody's problem. That is exactly the kind of work that has no natural owner in a pure feature-team setup.

## The fix that would have made it worse

The tempting answer is to stand up a central team that owns all of this. A platform team, or an architecture team, with its own backlog and the authority to enforce standards.

I did not want that, and I am glad I resisted it. A central team that owns non-functional work pulls people off product to staff it. It becomes a gate every change has to pass through. And it quietly strips the domain teams of the ownership that made them effective in the first place. You trade one overloaded CTO for one bottleneck team, and you lose team autonomy in the bargain. That is not a fix. It is the same failure wearing a different hat.

## Verticals: ownership without a backlog

What we did instead was create engineering verticals. A vertical is not a team. It is a cross-cutting functional stream with a named owner, layered over the existing domain teams. The people in it keep doing their product work. What they take on is direction for one non-functional concern across the whole estate.

The reason, in the words we wrote down in our Q1 plan, was to "prepare for team scale, unload CTO responsibilities without sacrificing focus." We named the verticals and their owners in one sitting:

| Vertical | Owner(s) | What it governs |
| --- | --- | --- |
| Architecture | Marcin, Paweł | system design, ADRs, technical direction |
| Infrastructure | Paweł, Maciej | cloud, [Kubernetes](https://kubernetes.io/), networking (Databases/Storage: Dawid) |
| Platform Monitoring | Patryk | observability, alerting, uptime |
| Security | Maciej, Dawid | access, RBAC, vulnerability handling |
| Design UI/UX | Adam, Filip | interface consistency, design direction |
| Costs | Greg | infrastructure spend, capacity |
| IT Admin | open at the time | internal tooling and accounts |

Each vertical maps to a concern that used to land on me by default, and each carries a few honest metrics rather than a vibe. Architecture and delivery watch the [DORA metrics](https://dora.dev/): deployment frequency, change failure rate, time to restore. Infrastructure and monitoring watch uptime and capacity. Where a decision needs to be recorded, it lands as an [architecture decision record](https://adr.github.io/) rather than in my head.

## The part that keeps teams autonomous

This is the bit that decides whether the model helps or just recreates the bottleneck. A vertical does not own a backlog, and it does not pull people off product work. It sets direction and leaves delivery where it belongs.

The Architecture vertical was the first to find its rhythm, and its loop looks like this. It runs a short meeting every two weeks. The meeting reviews each open issue, makes sure everyone understands it, weighs the options, picks an approach, and roughs out a phased plan with an estimate. That is the whole job of the meeting: decide a direction, not do the work.

What happens to that direction is the important part:

{% highlight text %}
vertical     ->  reviews issues, weighs options, drafts a phased plan
Refinement   ->  whole team reviews it and pushes back (extended to ~2h)
Planning     ->  work folded into the sprint, priority agreed with the PO
sprint       ->  the domain team delivers it as normal feature / bug work
{% endhighlight %}

The outcomes go to the team-wide Refinement, which we extended to about two hours specifically to make room for this. The whole team gets to react before anything is committed. Execution is then scheduled in each sprint's Planning, folded into normal feature and bug tasks, with priority agreed with the Product Owner like any other work. Nothing gets forced into a sprint by fiat. The vertical proposes; the team and the PO dispose.

So the principle is simple: verticals set direction and standards, and domain teams keep ownership of delivery. The architecture owner does not write the change behind everyone's back. They make sure the right change is understood, agreed, and scheduled through the same process as everything else.

It is already working beyond Architecture. The Infrastructure vertical ran its own review and surfaced a list of exactly the kind of work that previously had no owner: pod resource limits, health checks, the PostgreSQL 11 upgrade, the deprecated ingress controller. None of it was anyone's feature. All of it now has a stream that watches for it.

## What it costs, and what is still open

I am not going to pretend this is free. It adds meetings. It adds coordination overhead. The owners wear two hats now, product and vertical, and those two compete for the same hours. And there is a standing risk I am watching closely: a vertical that starts hoarding decisions slowly becomes the very gate I was trying to avoid. The thing that protects against that is the rule that a vertical never owns a backlog. The day one does, we have rebuilt the bottleneck.

It is also young. We named the verticals in January and the Architecture vertical only found its cadence in March. IT Admin was the one ownership we left open when we drew the map. I cannot tell you yet that this is the model that carries us through the next doubling of the team. What I can tell you is that the default routing of every non-functional question to the CTO has stopped, which was the immediate thing that needed to stop.

The open question I keep turning over: do verticals survive scale as verticals, or do they harden into teams with backlogs of their own, which is the exact thing we built them to avoid? If you have run something like this through a team growing past, say, twenty or thirty engineers and you know which way it tips, I would like to hear it. Comment below or send me an email.

## Links

- [Team Topologies](https://teamtopologies.com/) - stream-aligned and enabling teams
- [DORA metrics](https://dora.dev/) - deployment frequency, change failure rate, time to restore, reliability
- [Architecture decision records](https://adr.github.io/)
- [Tenix](https://tenix.eu/) and the public API at [tenix.tech](https://tenix.tech)
