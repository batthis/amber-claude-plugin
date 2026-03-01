# Amber — AI Phone Agent for Claude

> Give Claude a phone. Make and receive real calls, screen callers, book appointments, and manage contacts — all from Claude Code or Claude Desktop.

Amber connects Claude to the real phone network via a local voice bridge (Twilio + OpenAI Realtime). Once running, you can make outbound calls by name, have Amber pursue a stated objective on the call, screen incoming callers, take messages, and manage a full contact CRM — without leaving your Claude session.

---

## What You Can Do

### Make calls by name
```
/amber:call
```
> "Call Abe and remind him about the 3pm meeting"

Amber resolves the name via Apple Contacts, shows you who she's about to call, confirms, then dials. She greets the person warmly, mentions any personal context she knows, and pursues the objective — then summarizes the call when she's done.

### Screen incoming calls
```
/amber:screen
```
Amber answers your Twilio number, identifies the caller, finds out why they're calling, takes a message, and delivers a structured summary to you. She remembers every caller across sessions via the built-in CRM.

### Check call history
```
/amber:calls
```
View recent calls with AI-generated summaries and full transcripts.

### Check voicemail / missed calls
```
/amber:voicemail
```

---

## 9 MCP Tools

| Tool | Description |
|------|-------------|
| `make_call` | Dial by name or number with confirmation safeguard |
| `get_call_status` | Live status + transcript of active call |
| `get_call_history` | Recent calls with AI summaries |
| `start_screening` | Enable inbound call screening |
| `stop_screening` | Disable call screening |
| `crm` | Contact lookup, create, log interactions, view history |
| `calendar_query` | Check availability or create calendar events |
| `contacts_lookup` | Search Apple Contacts by name or number |
| `bridge_health` | Check if the voice bridge is running |

---

## Requirements

- **Twilio** account with a phone number
- **OpenAI** API key (for Realtime voice)
- **Node.js** v18+ on your machine
- **Amber voice bridge** running locally ([setup guide](https://clawhub.com/skills/amber-voice-assistant))

---

## Setup

### 1. Install the full Amber skill

The bridge (the actual voice engine) is distributed via ClawHub:

```bash
openclaw skill install amber-voice-assistant
cd ~/.openclaw/skills/amber-voice-assistant/runtime
npm run setup   # interactive setup wizard
npm start       # start the bridge
```

### 2. Install this plugin in Claude Code

```
/plugin marketplace add batthis/amber-claude-plugin
/plugin install amber-voice-agent@amber-plugins
```

### 3. Sync your contacts (optional, for calling by name)

```bash
cd ~/.openclaw/skills/amber-voice-assistant/runtime
npm run sync-contacts
```

That's it. Try `/amber:call` to make your first call.

---

## How It Works

```
You → Claude Code → MCP tools → Amber bridge (local) → Twilio → Phone call
                                      ↕
                               OpenAI Realtime
                               (Amber's voice)
```

The bridge runs entirely on your machine. Calls go out through your Twilio number. Nothing is stored in the cloud — call logs, CRM data, and transcripts are all local.

---

## Links

- **Full documentation & setup:** [clawhub.com/skills/amber-voice-assistant](https://clawhub.com/skills/amber-voice-assistant)
- **GitHub:** [github.com/batthis/amber-claude-plugin](https://github.com/batthis/amber-claude-plugin)
- **Support:** [abe@flixxaid.com](mailto:abe@flixxaid.com)
