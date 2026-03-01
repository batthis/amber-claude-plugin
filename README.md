# Amber — Claude Plugin Marketplace

A Claude Code plugin marketplace for **Amber**, the phone-capable voice agent.

## Install

Add this marketplace to Claude Code:

```
/plugin marketplace add batthis/amber-claude-plugin
```

Then install Amber:

```
/plugin install amber-voice-agent@amber-plugins
```

## What Amber Does

Gives Claude a phone. Once installed and configured with your Twilio credentials, you can:

- **Make calls by name** — `"Call Abe"` resolves via Apple Contacts
- **Screen incoming calls** — Amber answers, takes a message, notifies you
- **Book appointments** — Amber negotiates times over the phone
- **Manage CRM** — remembers every caller, tracks interactions
- **Query calendar** — checks availability before booking

## Available Commands

| Command | Description |
|---------|-------------|
| `/amber:call` | Make an outbound call |
| `/amber:calls` | View recent call history |
| `/amber:screen` | Toggle call screening on/off |
| `/amber:voicemail` | Check voicemail / missed calls |

## Requirements

- [Amber voice bridge](https://clawhub.com/skills/amber-voice-assistant) running locally
- Twilio account + phone number
- OpenAI API key (for Realtime voice)

## Full Setup

See the full setup guide at [clawhub.com/skills/amber-voice-assistant](https://clawhub.com/skills/amber-voice-assistant).
