---
layout: default
title: Privacy Policy — Amber Voice Agent
---

# Privacy Policy

**Amber — AI Phone Agent**
Last updated: March 1, 2026

## Overview

Amber is a self-hosted Claude plugin. All data processing happens locally on your own machine. We do not operate servers, collect analytics, or receive any data from your installation.

## What Amber Does With Your Data

### Call recordings and transcripts
Calls are handled through your own Twilio account using your own credentials. Call audio, transcripts, and summaries are stored locally in the `runtime/logs/` directory on your machine. Nothing is sent to us.

### Contact information
If you use the optional contacts sync feature (`npm run sync-contacts`), your Apple Contacts are exported to a local JSON file (`contacts-cache.json`) on your machine. This file is used only for name-to-number resolution when making calls. It is never uploaded or transmitted anywhere.

### CRM data
Caller names, phone numbers, and interaction notes are stored in a local SQLite database (`~/.config/amber/crm.sqlite`) on your machine. This data never leaves your device.

### Calendar data
Calendar queries use your local Apple Calendar via `ical-query`. No calendar data is transmitted to us.

## Third-Party Services

Amber connects to third-party services **that you configure with your own accounts and credentials**:

- **Twilio** — for phone call infrastructure. Subject to [Twilio's Privacy Policy](https://www.twilio.com/legal/privacy).
- **OpenAI** — for voice AI (Realtime API). Subject to [OpenAI's Privacy Policy](https://openai.com/policies/privacy-policy).

We have no visibility into your use of these services.

## What We Do Not Collect

- We do not collect usage analytics
- We do not receive call data, transcripts, or recordings
- We do not receive contact or CRM data
- We do not use cookies or tracking
- We do not have access to your Twilio or OpenAI accounts

## Open Source

Amber's full source code is publicly available for review at:
[github.com/batthis/amber-claude-plugin](https://github.com/batthis/amber-claude-plugin)

## Contact

Questions? Reach out at [abe@flixxaid.com](mailto:abe@flixxaid.com).
