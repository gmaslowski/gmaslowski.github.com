---
layout: post
title: "Smart Charging, Done Right"
date: 2019-04-28
description: How We Designed the Brains Behind Tenix Charging
category: blog
tag:
- ev
- smart charging
- ocpp
- smart buses
comments: true
image: assets/smart-charging-cost-optimized.png
---

This post was originally written as an article for Tenix https://tenix.eu .

# Smart Charging, Done Right - How We Designed the Brains Behind Tenix Charging

Managing charging for a large fleet of electric buses or trucks isn’t just about plugging in and hoping for the best. It’s a high-stakes balancing act—between vehicle readiness, energy constraints, infrastructure quirks, and cost pressures.

Even the most experienced operators face challenges like:
- Sudden power peaks or overloads that risk grid stability
- Vehicles not being charged in time for their next scheduled departure
- Higher-than-expected electricity costs due to poor timing
- Chargers or systems going offline, disrupting carefully laid plans
- A patchwork of brands and depot layouts, each with their own logic and needs

This isn’t “just charging.” This is **mission-critical orchestration** - and it deserves tools designed for the real world.

That’s exactly why we designed and developed Tenix Charge and its **Smart Charging** engine.

## The Mission

At Tenix, we designed our **Smart Charging** system not just to _simulate_ smart decisions in a test lab - but to deliver them, reliably, in the chaos of real-world depot operations.

That meant building charging logic that:
- **Respects power constraints** - whether they come from cabinet-level physical limits, dynamic grid thresholds, or cost-based caps
- **Prioritizes vehicle readiness** - ensuring each vehicle is charged in time for its next job, route, or task, not just “filled up”
- **Adapts in real-time** - responding to shifting energy availability, last-minute schedule changes, and depot dynamics
- **Remains operational even offline** - with chargers retaining safe, autonomous behavior during temporary disconnects from Tenix Charge
- **Plays along with the non-ideal reality** - supporting multi-brand environments, legacy hardware, and complex depot wiring
  
Oh - and above all, it had to be _simple and intuitive_ for dispatchers and depot operators to use. No PhDs required.

## The essential modes of Tenix Smart Charging

We engineered three modes, each tailored for different operational goals. These modes are not mutually exclusive - they can coexist across chargers within the same depot.

The original design? Believe it or not, the core logic emerged in a jacuzzi - proof that solid engineering ideas can strike anywhere, as long as the thinking is sharp.

### 1. **Load Balancing**

**Coordinated. Fair. Infrastructure-aware.**

Unlike traditional load balancing that operates inside a single charger, Tenix shifts the intelligence to the **system level** - distributing available power across _all_ active charging sesisons in the depot.

- Dynamically splits site power budget across running sessions
- Takes into account infrastructure constraints like cabinet-level limits
- No scheduling logic, no energy price planning, no individual prioritization
- Ideal for in-circulation vehicles or during operational hours with high unpredictability

**Key Benefits**:

- Prevents overloads by respecting real infrastructure limits    
- Balances power fairly across all active sessions
- Maximizes throughput without micromanagement
- Avoids inefficient static configurations of power output, dictated by high utilization periods

![Smart Charging - Load Balancing]({{ site.url }}/assets/smart-charging-load-balancing.png)

### 2. **Time-Constrained**

**Deadline-driven. Non-negotiable. Always ready.**

When departure time is the priority, this mode makes sure vehicles are charged and ready - _no excuses, no delays_.

- Charging begins immediately when a vehicle is plugged in
- System ensures SoC targets are met by the scheduled departure (or preferred charging slots)
- Ignores price signals or cost optimization to guarantee readiness

**Best for**:
- Out-of-circulation vehicles with fixed routes, school runs, or depot-exit deadlines
- Operations where a missed departure equals a missed service

**Key Benefits**:
- Guarantees availability, no matter the power cost
- Simple to operate - plug in and forget
- Designed for peace of mind in time-critical scenarios


![Smart Charging - Time Constrained]({{ site.url }}/assets/smart-charging-time-constrained.png)

### 3. **Cost-Optimized**

**Price-aware. Schedule-safe. Strategically delayed.**

This mode minimizes energy costs without compromising on readiness. The system shifts charging into low-tariff windows - but still ensures every vehicle is ready to roll when needed.

- Charging schedules are aligned with predicted low-cost energy periods    
- Departure readiness is still fully respected
- Charging may be delayed to hit energy price-optimal slots - but only when it’s safe to do so
  
**Best for**:
- Fleets operating under tight cost constraints
- Depots with dynamic tariffs or day-ahead pricing contracts

**Key Benefits**:
- Cuts energy costs without dispatcher stress
- Makes price signals actionable without manual intervention
- Balances operational goals with financial discipline


![Smart Charging - Cost Optimized]({{ site.url }}/assets/smart-charging-cost-optimized.jpg)

## The Smarts Behind the Modes

Every mode operates on a shared foundation of system-wide intelligence and operational resilience:

- **Vehicle-Aware Charging** – Considers real-world information: charging power constraints (charger, connector), vehicle (battery capacity), departure time, assigned route
- **Depot-Wide Coordination** – Power isn’t managed charger-by-charger, but holistically across Power Groups and infrastructure constraints
- **Live Replanning** – Continuously recalculates charging schedules as vehicles arrive, plans change, or power availability shifts
- **Offline Resilience** – Chargers retain local fallback behavior and limits when disconnected from the backend - no chaos during connection hiccups
- **Vendor Agnostic** – Works across mixed-brand environments via OCPP 1.6j, and built to embrace 2.x where supported
- **Manual Boosting** – When something unplanned happens - vehicle swap, route change, new departure - you can override the plan with one click and reprioritize charging on the spot

## Designed for Flexibility

We structured our backend to understand depots not just as a flat list of chargers, but as interconnected Power Groups and Power Consumers:

- Power Groups = cabinets or logical power zones
- Consumers/Producers = building load, PV (PhotoVoltaic panels), ESS (Energy Storage Systems)

This model lets us adapt to_how_a depot is wired - not just how a charger is labeled.

## Why Tenix Smart Charging is the right choice?

The future of fleet electrification isn’t just about putting plugs in the ground. It’s about making charging:

- Predictable
- Affordable
- Resilient

At Tenix, I didn’t just design the charging modes - I designed them to solve real operator pain, with a platform that’s flexible, battle-tested, and ready for scale.

Let’s just say, we’ve done the thinking - so you don’t blow a fuse. Literally.

Want to see it in action? [Get in touch](https://tenix.eu/). Or better - ask your charger if it’s Tenix-smart yet. 😉

# Links
- https://tenix.eu/news/tenix-smart-charging/
