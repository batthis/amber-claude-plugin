---
name: calls
description: View recent call history, transcripts, and summaries
arguments:
  - name: filter
    description: "all", "inbound", "outbound", or "missed" (default: all)
    required: false
  - name: limit
    description: Number of recent calls to show (default: 10)
    required: false
---

# /amber-voice-agent:calls

View your recent call history with transcripts and AI-generated summaries.

## Usage

```
/amber-voice-agent:calls
/amber-voice-agent:calls inbound
/amber-voice-agent:calls outbound 5
```

## Output

For each call, shows:
- Direction (inbound/outbound)
- Caller/recipient name and number
- Date and duration
- AI summary of the conversation
- Full transcript (expandable)
