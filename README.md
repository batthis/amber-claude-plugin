# Amber — Claude Plugin Marketplace

Plugin marketplace for **Amber**, the AI phone agent for Claude Code and Claude Desktop.

This repository contains only the Claude Code plugin packaging. The phone runtime, Twilio/OpenAI setup, local CRM, call logs, transcripts, and confirmation safeguards live in the full Amber bridge distributed through ClawHub/OpenClaw.

## Prerequisites

Install and run the full Amber bridge before installing the Claude plugin:

```bash
openclaw skill install amber-voice-assistant
cd ~/.openclaw/skills/amber-voice-assistant/runtime
npm run setup
npm start
```

The bridge listens locally at `http://127.0.0.1:8000` by default. Configure any Twilio, OpenAI, ngrok, or operator secrets in the bridge setup, not in this plugin repository.

## Install

```
/plugin marketplace add batthis/amber-claude-plugin
/plugin install amber-voice-agent@amber-plugins
```

## Plugins

### [amber-voice-agent](./plugins/amber-voice-agent)

Give Claude a phone. Make and receive real calls, screen incoming callers, book appointments, and manage a contact CRM — all from Claude Code or Claude Desktop.

- MCP tools for calls, screening, CRM, calendar, contacts, and bridge health
- Calls by name via Apple Contacts
- Built-in CRM that remembers every caller
- Full setup wizard
- Self-contained Claude plugin MCP proxy; no paths outside the installed plugin cache

**[Read the full docs →](./plugins/amber-voice-agent/README.md)**

---

## Claude Plugin Directory Readiness

The marketplace and plugin now follow Claude Code's installed-plugin constraints:

- Plugin manifest: `plugins/amber-voice-agent/.claude-plugin/plugin.json`
- Marketplace catalog: `.claude-plugin/marketplace.json`
- MCP config: `plugins/amber-voice-agent/.mcp.json`
- Bundled local proxy: `plugins/amber-voice-agent/mcp-server.js`

The MCP config starts `node ${CLAUDE_PLUGIN_ROOT}/mcp-server.js`, so marketplace installs do not depend on files outside the copied plugin directory. The proxy forwards tool calls to the user's local Amber bridge through `AMBER_BRIDGE_URL` and optional `BRIDGE_API_TOKEN`; it does not carry Twilio/OpenAI secrets and must not bypass the bridge's own confirmation and safety checks.

## Configuration

| Variable | Default | Purpose |
|----------|---------|---------|
| `AMBER_BRIDGE_URL` | `http://127.0.0.1:8000` | Local Amber bridge base URL. |
| `BRIDGE_API_TOKEN` | unset | Optional token when the bridge requires local API authentication. |

Claude Code also prompts for these through plugin user configuration when supported. Never commit real bridge tokens, Twilio credentials, OpenAI keys, or ngrok tokens to this repository.

**Homepage:** [clawhub.com/skills/amber-voice-assistant](https://clawhub.com/skills/amber-voice-assistant)
