# Amber — AI Phone Agent for Claude

> Give Claude a phone. Make and receive real calls, screen callers, book appointments, and manage contacts — all from Claude Code or Claude Desktop.

Amber connects Claude to the real phone network via a local voice bridge (Twilio + OpenAI Realtime). Once running, you can make outbound calls by name, have Amber pursue a stated objective on the call, screen incoming callers, take messages, and manage a full contact CRM — without leaving your Claude session.

This Claude plugin is a thin, installable MCP package. It does not include the Amber runtime. Install and run the full Amber bridge through ClawHub/OpenClaw first, then install this plugin so Claude can talk to that local bridge.

---

## What You Can Do

### Make calls by name
```
/amber-voice-agent:call
```
> "Call Abe and remind him about the 3pm meeting"

Amber resolves the name via Apple Contacts, shows you who she's about to call, confirms, then dials. She greets the person warmly, mentions any personal context she knows, and pursues the objective — then summarizes the call when she's done.

### Screen incoming calls
```
/amber-voice-agent:screen
```
Amber answers your Twilio number, identifies the caller, finds out why they're calling, takes a message, and delivers a structured summary to you. She remembers every caller across sessions via the built-in CRM.

### Check call history
```
/amber-voice-agent:calls
```
View recent calls with AI-generated summaries and full transcripts.

### Check voicemail / missed calls
```
/amber-voice-agent:voicemail
```

---

## MCP Tools

| Tool | Description |
|------|-------------|
| `make_call` | Dial by name or number with confirmation safeguard |
| `get_call_status` | Live status + transcript of active call |
| `end_call` | Terminate an active call |
| `get_call_history` | Recent calls with AI summaries |
| `start_screening` | Enable inbound call screening |
| `stop_screening` | Disable call screening |
| `get_screening_status` | Check whether screening is active |
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

Keep all Twilio, OpenAI, ngrok, operator, and bridge secrets in the Amber bridge setup. This Claude plugin only needs the local bridge URL and, if enabled by the bridge, a bridge API token.

### 2. Install this plugin in Claude Code

```
/plugin marketplace add batthis/amber-claude-plugin
/plugin install amber-voice-agent@amber-plugins
```

### 3. Configure the local bridge connection

Defaults:

| Variable | Default | Purpose |
|----------|---------|---------|
| `AMBER_BRIDGE_URL` | `http://127.0.0.1:8000` | Local Amber bridge base URL. |
| `BRIDGE_API_TOKEN` | unset | Optional token when the bridge requires local API authentication. |

Claude Code versions that support plugin `userConfig` prompt for these values when enabling the plugin. You can also set them in the environment before starting Claude Code.

### 4. Sync your contacts (optional, for calling by name)

```bash
cd ~/.openclaw/skills/amber-voice-assistant/runtime
npm run sync-contacts
```

That's it. Try `/amber-voice-agent:call` to make your first call.

---

## How It Works

```
You → Claude Code → MCP tools → Amber bridge (local) → Twilio → Phone call
                                      ↕
                               OpenAI Realtime
                               (Amber's voice)
```

The bridge runs entirely on your machine. Calls go out through your Twilio number. Nothing is stored in the cloud — call logs, CRM data, and transcripts are all local.

The plugin starts a bundled `mcp-server.js` proxy from inside the installed plugin directory. That proxy forwards MCP tool calls to `AMBER_BRIDGE_URL`; it does not reference `../../runtime` or any files outside Claude Code's plugin cache. Real-world actions still rely on the Amber bridge's safeguards, including recipient/objective confirmation before outbound calls and any extra bridge-side authorization configured by the user.

## Directory Review Notes

This plugin is packaged for Claude Code marketplace review:

- `.claude-plugin/plugin.json` contains the plugin identity, version, license, repository, homepage, and user configuration metadata.
- `.mcp.json` only starts a script bundled in the plugin directory.
- No Twilio, OpenAI, ngrok, or bridge secrets are committed.
- The full Amber bridge remains a separate ClawHub/OpenClaw install and must be running locally before the plugin can place or screen calls.

---

## Links

- **Full documentation & setup:** [clawhub.com/skills/amber-voice-assistant](https://clawhub.com/skills/amber-voice-assistant)
- **GitHub:** [github.com/batthis/amber-claude-plugin](https://github.com/batthis/amber-claude-plugin)
- **Support:** [abe@flixxaid.com](mailto:abe@flixxaid.com)
