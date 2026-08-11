# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two audiences, both real:

- **Portfolio viewers** (prospective clients, recruiters, collaborators) evaluating this as a sample of design/dev craft. This is the actual primary audience — the project is not a live business.
- **Simulated end user**: a fictional barbershop customer in a Buenos Aires-style neighborhood, deciding whether to book a haircut/shave, comparing options, wanting to trust the place quickly before reserving by WhatsApp, phone, or form. The design must convincingly serve this persona even though no real transaction happens.

## Product Purpose

A portfolio/demo landing page that demonstrates a premium, editorial barbershop web design (poster typography, monochrome system, motion craft — see DESIGN.md) built on a believable but explicitly fictional local business. Success means the craft reads as production-grade while never letting a viewer mistake it for a real, operating business.

## Positioning

Demonstrates a distinctive, non-templated visual and motion system (documented in DESIGN.md) applied convincingly to a realistic local-business use case, while being transparent that it is a demo — not a working barbershop.

## Operating Context

Static front-end only (React 19 + Vite + Tailwind 4 + GSAP + motion + Lenis, per package.json). No backend: the booking form does not submit anywhere real, and outbound links (WhatsApp, social, maps) do not lead to real destinations for this business.

## Capabilities and Constraints

- **No specific/branded business identity.** The business name must be a generic barbershop name/identity, not a distinctive brand like "Navaja & Roble" that could read as a real establishment. Address, phone, and social handles must likewise be generic placeholders, not specific enough to look real.
- **External links must disclose, not navigate.** Links to WhatsApp, social media (Instagram/Facebook/TikTok), and maps must not take the visitor to a real destination. Instead they trigger a toast/notice explaining that in a real deployment this would link out to the business's real channels — the same disclosure pattern used across the user's other demo projects.
- **Footer must carry an explicit demo notice**, stating clearly that this is a demo project, consistent with the pattern used in the user's prior projects (not a functioning business site).
- The booking form is decorative/demonstrative; it does not need a real submission backend.
- Content in `src/data/site.js` (services, prices, team, testimonials, schedule, gallery) is placeholder example content, not real business data, and can be freely adjusted — but should stay internally consistent and read as a plausible generic barbershop.

## Brand Commitments

None. Deliberately generic: no proprietary name, logo, or identity should be established as "the brand" beyond what's needed to demonstrate the design system credibly.

## Evidence on Hand

All copy, pricing, team bios, testimonials, and schedule in `src/data/site.js` are fabricated placeholder content for demo purposes. None of it describes a real business, and future work must not present it as real (must not add a specific brand name/address that reads as authentic) or invent additional "real-sounding" claims beyond what's already placeholder.

## Product Principles

1. **Disclosure over illusion.** The demo must always make it clear to a visitor that it isn't a real, bookable business — via the footer notice and the outbound-link toasts — even while the visual craft aims to look fully production-grade.
2. **Generic over branded.** Names, addresses, and handles stay generic barbershop placeholders; nothing should be distinctive enough to be mistaken for an actual operating business.
3. **DESIGN.md is the visual authority.** Content and behavior changes (renaming, toasts, footer notice) must fit the existing monochrome/poster system and motion rules, not introduce new visual language.
4. **No real transactions.** Booking, calls, and outbound social/maps links are demonstrative only; nothing should imply a real backend or real destination exists.
