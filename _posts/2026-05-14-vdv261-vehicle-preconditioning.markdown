---
layout: post
title: "VDV 261: What Nobody Tells You About the Implementation"
date: 2026-05-14
description: The technical problems behind implementing VDV 261 for electric bus preconditioning — certificate management, TLS, protocol gaps, and three-vendor coordination.
category: blog
tag:
- ev
- ocpp
- vdv261
- iso15118
- electric buses
- depot operations
comments: true
image: assets/vdv261.png
---

So you want to add preconditioning support to your Charge Management System. Buses need to be warm (or cool) before departure, powered by the grid rather than the traction battery. The protocol that enables this is [VDV 261](https://www.vdv.de/), defined by the [VDV](https://www.vdv.de/) (Verband Deutscher Verkehrsunternehmen). The spec is readable. What you are about to build is not trivial.

Start with the communication architecture, because it shapes everything else:

```
Vehicle  ⟷  Charger  ⟷  CMS
```

VDV 261 runs as part of [ISO 15118](https://www.charin.global/technology/iso15118/) Value Added Services (VAS). Your CMS never talks to the vehicle directly. The charger terminates the ISO 15118 TLS session on the vehicle side, extracts the VAS payload, and forwards it to your backend over HTTPS. Three vendors in the chain. Two protocols. Your system is the last one — and the one responsible for the plan.

Here is what you need to get right.

## Build a Certificate Management Pipeline

[ISO 15118](https://www.charin.global/technology/iso15118/) requires TLS. The VDV 261 spec (V2ICP-16) mandates `TLS_ECDHE_ECDSA_WITH_AES_128_CBC_SHA256` for the vehicle-side connection. Authentication happens via a V2ICP Root Certificate pre-installed on the vehicle — and that installation requires a **diagnostic tester operated by the depot** (V2ICP-17). You cannot push it remotely. The spec recommends the certificate validity be long enough that updates are not necessary at all (V2ICP-18), because updating it means physically touching every vehicle.

This shapes your certificate strategy in a specific way: the root cert on the vehicle side is long-lived and operator-managed, outside your control. What you do control is the charger (EVSE) side — the certificate your CMS provisions to each charger, which the vehicle validates against the pre-installed root. That certificate needs to be valid, correctly chained, and distributed to chargers before it expires. Your pipeline needs to track expiry across every EVSE in every depot, renew before it, and push the updated certificate back to the charger over [OCPP](https://openchargealliance.org/protocols/open-charge-point-protocol/). [OCPP 1.6](https://openchargealliance.org/protocols/open-charge-point-protocol/#OCPP1.6) and [OCPP 2.0.1](https://openchargealliance.org/protocols/open-charge-point-protocol/#OCPP2.0.1) handle this differently, so you will need to handle both.

The full chain: EVSE leaf certificate → Sub-CA → [V2G Root CA](https://www.hubject.com/pki/). Getting any layer wrong is silent — the charger looks healthy, the session looks healthy, the vehicle just never starts preconditioning.

## Solve IPv6 Before It Becomes a Site Problem

VDV 261 mandates IPv6 end-to-end. Your backend is almost certainly IPv4. That gap needs to be resolved before you go live — not after the first depot complains that VDV 261 sessions never establish.

Your options: [NAT64](https://www.rfc-editor.org/rfc/rfc6146)/[DNS64](https://www.rfc-editor.org/rfc/rfc6147) on the charger or in the network layer between charger and CMS, or an IPv6⇄IPv4 proxy. Most charger vendors have not solved this cleanly out of the box, so plan to own it.

Separately, your HTTPS endpoint needs to work with charger TLS stacks, which are not browsers. Cipher suites, certificate chain trust, and mutual TLS requirements all have to match what each charger model actually supports. Mismatches fail silently or produce cryptic timeout logs that look like network issues.

## Implement the Protocol — Including the Parts the Spec Leaves Open

The data loop runs every 10 seconds. The vehicle sends its battery and HVAC preconditioning requirements. Your CMS responds with departure time, mode, and ambient temperature. Then it repeats. The structure is clear. The semantics of specific fields are where you will spend time.

Two parameters need careful handling.

**`prec_dsrd`** — your signal to the vehicle that preconditioning should happen (0 = no, 1 = yes). What the vehicle actually does with a `1` is, verbatim from the spec: *"herstellerspezifisch"* — manufacturer-specific. You set the flag. The OEM decides what it means. Two compliant vehicles from different manufacturers can respond completely differently to the same value, and you will not know until you test against real firmware.

**`prec_hvac`** — your HVAC mode request:
- `0` — only hot water and ventilation
- `1` — hot water and heating
- `2` — no hot water, cooling or ventilation
- `3` — no climate preconditioning, or automatic preselection by the vehicle

Value `3` is doing double duty: "skip HVAC preconditioning" and "let the vehicle decide" are both valid interpretations. The spec also includes an explicit note that a vehicle with automatic climate control may ignore this parameter entirely. Your CMS can send a mode. The vehicle may not act on it. Build accordingly.

The third issue is upstream: the vehicle reports `prec_eamount` (cabin preconditioning energy) and `prec_reqtime` (time required), alongside `bat_eamount` and `bat_reqtime` for battery preconditioning. Your plan is built on these inputs. If a vehicle reports 20 minutes and 8 kWh when it actually needs 35 minutes and 14 kWh, the plan is wrong from the start. Part of the implementation work is validating reported values against real behaviour across vehicle models and ambient temperature ranges.

## Plan for Three-Vendor Coordination

This is the part that takes the most calendar time — not engineering time.

Making VDV 261 work end-to-end means the vehicle OEM, the charger manufacturer, and your team have to agree on the unspecified cases. That requires getting all three in the same conversation, with access to actual firmware and software rather than spec documents. Each vendor has their own release cycle and support process. A bug in the charger's VAS forwarding is a ticket to the charger vendor. A bug in the vehicle's certificate handling is a ticket to the OEM. A bug in your CMS is yours to fix.

Triangulating which layer is at fault from a TLS handshake failure or a missing 10-second heartbeat requires protocol-level diagnostic capability — not application logs, actual [ISO 15118](https://www.charin.global/technology/iso15118/) / V2ICP message traces. Build or acquire that capability early.

In a mixed-vendor depot — multiple vehicle OEMs, multiple charger brands — this is not a one-time exercise. Every new vehicle model or charger firmware version is a new combination to validate.

The compliance checkbox does not substitute for tested interoperability.

---

*We wrote a more detailed breakdown of VDV 261 architecture and integration requirements in the [Tenix whitepaper on vehicle preconditioning](https://tenix.eu/ebooks/vehicle-preconditioning-with-vdv26-whitepaper/).*
