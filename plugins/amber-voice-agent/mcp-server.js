#!/usr/bin/env node
"use strict";

const DEFAULT_BRIDGE_URL = "http://127.0.0.1:8000";
const PROTOCOL_VERSION = "2024-11-05";
const SERVER_VERSION = "1.0.1";

const bridgeUrl = normalizeBaseUrl(
  firstConfiguredValue(
    process.env.AMBER_BRIDGE_URL,
    process.env.CLAUDE_PLUGIN_OPTION_bridge_url,
    DEFAULT_BRIDGE_URL
  )
);
const bridgeApiToken = firstConfiguredValue(
  process.env.BRIDGE_API_TOKEN,
  process.env.CLAUDE_PLUGIN_OPTION_bridge_api_token,
  ""
);

const tools = [
  {
    name: "make_call",
    description:
      "Initiate a real outbound phone call through the local Amber bridge. The bridge must enforce recipient/objective confirmation before dialing.",
    inputSchema: {
      type: "object",
      properties: {
        to: {
          type: "string",
          description: "Phone number in E.164 format or a contact name the bridge can resolve."
        },
        objective: {
          type: "string",
          description: "What Amber should accomplish on the call."
        },
        mode: {
          type: "string",
          enum: ["conversation", "message"],
          description: "conversation for an interactive call, message for one-way delivery."
        }
      },
      required: ["to", "objective"],
      additionalProperties: true
    }
  },
  {
    name: "get_call_status",
    description: "Get live status, transcript, and summary for an active or recent Amber call.",
    inputSchema: {
      type: "object",
      properties: {
        callId: { type: "string", description: "Call ID returned by make_call." }
      },
      required: ["callId"],
      additionalProperties: true
    }
  },
  {
    name: "end_call",
    description: "End an active Amber call.",
    inputSchema: {
      type: "object",
      properties: {
        callId: { type: "string", description: "Call ID to end." }
      },
      required: ["callId"],
      additionalProperties: true
    }
  },
  {
    name: "get_call_history",
    description: "Retrieve recent Amber call logs, transcripts, and summaries.",
    inputSchema: {
      type: "object",
      properties: {
        filter: {
          type: "string",
          enum: ["all", "inbound", "outbound", "missed"],
          description: "Call direction/status filter."
        },
        limit: { type: "number", description: "Maximum number of calls to return." }
      },
      additionalProperties: true
    }
  },
  {
    name: "start_screening",
    description: "Enable inbound call screening on the configured Amber/Twilio number.",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: true
    }
  },
  {
    name: "stop_screening",
    description: "Disable inbound call screening.",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: true
    }
  },
  {
    name: "get_screening_status",
    description: "Check whether inbound call screening is active.",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: true
    }
  },
  {
    name: "crm",
    description: "Look up, create, update, log, or review Amber CRM contacts and interactions.",
    inputSchema: {
      type: "object",
      properties: {
        action: {
          type: "string",
          enum: ["lookup", "create", "update", "log", "history"],
          description: "CRM operation to perform."
        },
        identifier: { type: "string", description: "Phone number, contact name, or contact ID." },
        name: { type: "string", description: "Contact name." },
        phone: { type: "string", description: "Contact phone number." },
        email: { type: "string", description: "Contact email." },
        notes: { type: "string", description: "Contact notes or interaction notes." },
        tags: { type: "array", items: { type: "string" }, description: "Contact tags." }
      },
      required: ["action"],
      additionalProperties: true
    }
  },
  {
    name: "calendar_query",
    description: "Check calendar availability or create calendar events through Amber.",
    inputSchema: {
      type: "object",
      properties: {
        action: { type: "string", enum: ["lookup", "create"], description: "Calendar operation." },
        query: { type: "string", description: "Natural language availability query." },
        title: { type: "string", description: "Event title for create." },
        start: { type: "string", description: "Event start time in ISO 8601 format." },
        end: { type: "string", description: "Event end time in ISO 8601 format." },
        calendar: { type: "string", description: "Calendar name or ID." },
        location: { type: "string", description: "Event location." },
        notes: { type: "string", description: "Event notes." }
      },
      required: ["action"],
      additionalProperties: true
    }
  },
  {
    name: "contacts_lookup",
    description: "Search local contacts by name or number through Amber.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Name, phone number, or search text." }
      },
      required: ["query"],
      additionalProperties: true
    }
  },
  {
    name: "bridge_health",
    description: "Check whether the local Amber bridge is reachable.",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: true
    }
  }
];

let nextBridgeRequestId = 1;
let inputBuffer = "";
let outputMode = "line";

process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => {
  inputBuffer += chunk;
  for (const message of readMessages()) {
    void handleMessage(message);
  }
});

process.stdin.on("end", () => {
  process.exit(0);
});

function readMessages() {
  const messages = [];

  while (inputBuffer.length > 0) {
    if (inputBuffer.startsWith("Content-Length:")) {
      outputMode = "content-length";
      const headerEnd = inputBuffer.indexOf("\r\n\r\n");
      if (headerEnd === -1) {
        break;
      }

      const header = inputBuffer.slice(0, headerEnd);
      const match = /^Content-Length:\s*(\d+)/im.exec(header);
      if (!match) {
        inputBuffer = "";
        writeError(null, -32700, "Invalid Content-Length header");
        break;
      }

      const length = Number(match[1]);
      const bodyStart = headerEnd + 4;
      const bodyEnd = bodyStart + length;
      if (inputBuffer.length < bodyEnd) {
        break;
      }

      messages.push(inputBuffer.slice(bodyStart, bodyEnd));
      inputBuffer = inputBuffer.slice(bodyEnd);
      continue;
    }

    const newlineIndex = inputBuffer.indexOf("\n");
    if (newlineIndex === -1) {
      break;
    }

    const line = inputBuffer.slice(0, newlineIndex).trim();
    inputBuffer = inputBuffer.slice(newlineIndex + 1);
    if (line) {
      messages.push(line);
    }
  }

  return messages;
}

async function handleMessage(rawMessage) {
  let message;
  try {
    message = JSON.parse(rawMessage);
  } catch (error) {
    writeError(null, -32700, `Invalid JSON: ${error.message}`);
    return;
  }

  if (!Object.prototype.hasOwnProperty.call(message, "id")) {
    return;
  }

  try {
    const result = await handleRequest(message.method, message.params || {});
    writeResponse(message.id, result);
  } catch (error) {
    writeError(message.id, error.code || -32603, error.message || String(error));
  }
}

async function handleRequest(method, params) {
  switch (method) {
    case "initialize":
      return {
        protocolVersion: params.protocolVersion || PROTOCOL_VERSION,
        capabilities: { tools: {} },
        serverInfo: {
          name: "amber-voice-agent-proxy",
          version: SERVER_VERSION
        }
      };
    case "ping":
      return {};
    case "tools/list":
    case "listTools":
      return { tools };
    case "tools/call":
    case "callTool": {
      const name = params.name;
      const args = params.arguments || params.args || {};
      if (!tools.some((tool) => tool.name === name)) {
        const error = new Error(`Unknown Amber tool: ${name}`);
        error.code = -32602;
        throw error;
      }
      return normalizeToolResult(await callBridgeTool(name, args));
    }
    default: {
      const error = new Error(`Unsupported method: ${method}`);
      error.code = -32601;
      throw error;
    }
  }
}

async function callBridgeTool(name, args) {
  if (name === "bridge_health") {
    return callBridgeHealth(args);
  }

  const attempts = [
    {
      label: "MCP JSON-RPC /mcp",
      method: "POST",
      path: "/mcp",
      body: {
        jsonrpc: "2.0",
        id: nextBridgeRequestId++,
        method: "tools/call",
        params: { name, arguments: args }
      },
      unwrapJsonRpc: true
    },
    {
      label: "MCP REST /mcp/tools/call",
      method: "POST",
      path: "/mcp/tools/call",
      body: { name, arguments: args }
    },
    {
      label: "MCP REST /mcp/tools/{name}",
      method: "POST",
      path: `/mcp/tools/${encodeURIComponent(name)}`,
      body: args
    },
    {
      label: "tool REST /tools/{name}",
      method: "POST",
      path: `/tools/${encodeURIComponent(name)}`,
      body: args
    },
    {
      label: "API REST /api/tools/{name}",
      method: "POST",
      path: `/api/tools/${encodeURIComponent(name)}`,
      body: args
    },
    {
      label: "Amber API REST /api/amber/{name}",
      method: "POST",
      path: `/api/amber/${encodeURIComponent(name)}`,
      body: args
    }
  ];

  return tryBridgeAttempts(attempts);
}

async function callBridgeHealth(args) {
  const attempts = [
    { label: "health /health", method: "GET", path: "/health" },
    { label: "health /api/health", method: "GET", path: "/api/health" },
    { label: "health /status", method: "GET", path: "/status" },
    {
      label: "MCP bridge_health",
      method: "POST",
      path: "/mcp",
      body: {
        jsonrpc: "2.0",
        id: nextBridgeRequestId++,
        method: "tools/call",
        params: { name: "bridge_health", arguments: args || {} }
      },
      unwrapJsonRpc: true
    }
  ];

  return tryBridgeAttempts(attempts);
}

async function tryBridgeAttempts(attempts) {
  const failures = [];
  for (const attempt of attempts) {
    try {
      return await fetchBridge(attempt);
    } catch (error) {
      failures.push(`${attempt.label}: ${error.message}`);
    }
  }

  throw new Error(
    `Amber bridge is not reachable at ${bridgeUrl}. Start the Amber bridge locally, verify AMBER_BRIDGE_URL, and ensure the bridge enforces its confirmation safeguards. Attempts: ${failures.join("; ")}`
  );
}

async function fetchBridge(attempt) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  const headers = {
    Accept: "application/json"
  };
  const options = {
    method: attempt.method,
    headers,
    signal: controller.signal
  };

  if (bridgeApiToken) {
    headers.Authorization = `Bearer ${bridgeApiToken}`;
    headers["X-Bridge-Api-Token"] = bridgeApiToken;
  }

  if (attempt.body !== undefined) {
    headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(attempt.body);
  }

  try {
    const response = await fetch(`${bridgeUrl}${attempt.path}`, options);
    const text = await response.text();
    const data = text ? parseJson(text) : {};

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}${text ? ` ${truncate(text)}` : ""}`);
    }

    if (attempt.unwrapJsonRpc) {
      if (data.error) {
        throw new Error(data.error.message || JSON.stringify(data.error));
      }
      return data.result !== undefined ? data.result : data;
    }

    return data;
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("request timed out");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function normalizeToolResult(result) {
  if (result && Array.isArray(result.content)) {
    return result;
  }

  if (typeof result === "string") {
    return { content: [{ type: "text", text: result }] };
  }

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(result ?? {}, null, 2)
      }
    ]
  };
}

function normalizeBaseUrl(value) {
  return (value || DEFAULT_BRIDGE_URL).replace(/\/+$/, "");
}

function firstConfiguredValue(...values) {
  for (const value of values) {
    if (value && !/^\$\{[^}]+}$/.test(value)) {
      return value;
    }
  }
  return "";
}

function parseJson(text) {
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`invalid JSON response: ${truncate(text)}`);
  }
}

function truncate(text) {
  return text.length > 300 ? `${text.slice(0, 300)}...` : text;
}

function writeResponse(id, result) {
  writeMessage({ jsonrpc: "2.0", id, result });
}

function writeError(id, code, message) {
  writeMessage({ jsonrpc: "2.0", id, error: { code, message } });
}

function writeMessage(message) {
  const payload = JSON.stringify(message);
  if (outputMode === "content-length") {
    process.stdout.write(`Content-Length: ${Buffer.byteLength(payload, "utf8")}\r\n\r\n${payload}`);
    return;
  }

  process.stdout.write(`${payload}\n`);
}
