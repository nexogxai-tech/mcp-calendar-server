// server.js
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
// allow simple CORS so external services can fetch your endpoints
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

// --- Tool definition (minimal, ASCII-friendly) ---
const toolsDefinition = {
  tools: [
    {
      name: "create_reservation",
      description: "Create a calendar reservation",
      input_schema: {
        type: "object",
        properties: {
          customer_name: { type: "string" },
          party_size: { type: "integer" },
          date: { type: "string" },
          time: { type: "string" },
          notes: { type: "string" }
        },
        required: ["customer_name", "party_size", "date", "time"]
      }
    }
  ]
};

function wantsJson(req) {
  const accept = (req.headers.accept || "").toLowerCase();
  return accept.includes("application/json") || req.query.format === "json";
}

// --- /mcp: returns JSON when client asks for JSON, otherwise small HTML dashboard ---
app.get("/mcp", (req, res) => {
  console.log("⚡ GET /mcp from", req.ip, "accept=", req.headers.accept);
  if (wantsJson(req)) {
    return res.json(toolsDefinition);
  }
  // HTML dashboard for humans visiting in a browser
  res.send(`
    <html>
      <head><title>MCP Google Calendar Server</title></head>
      <body style="font-family: system-ui, Arial; padding: 24px;">
        <h1>MCP Google Calendar Server</h1>
        <p>Version: 1.0.0</p>
        <h2>MCP Endpoint</h2>
        <pre>${req.protocol}://${req.get("host")}/mcp</pre>
        <h2>Available Tools</h2>
        <ul>
          <li><b>create_reservation</b>: Create a new calendar reservation</li>
        </ul>
        <h3>API Endpoints</h3>
        <ul>
          <li><a href="/mcp?format=json">/mcp (JSON)</a></li>
          <li><a href="/mcp/tools">/mcp/tools (JSON)</a></li>
          <li><a href="/mcp/run/create_reservation">/mcp/run/create_reservation (POST)</a></li>
        </ul>
      </body>
    </html>
  `);
});

// --- /mcp/tools (always returns JSON) ---
app.get("/mcp/tools", (req, res) => {
  console.log("⚡ GET /mcp/tools from", req.ip, "accept=", req.headers.accept);
  res.json(toolsDefinition);
});

// --- action endpoint used by ElevenLabs when it runs the tool ---
app.post("/mcp/run/create_reservation", (req, res) => {
  console.log("🎯 POST /mcp/run/create_reservation payload:", req.body);
  // For now we just echo success; later plug Google Calendar logic here
  return res.json({
    success: true,
    message: `Reservation received for ${req.body.customer_name || "unknown"} on ${req.body.date || "unknown"} at ${req.body.time || "unknown"}.`
  });
});

// health
app.get("/", (req, res) => res.send("✅ MCP Server running"));

// start
app.listen(PORT, () => console.log(`🚀 MCP server listening on port ${PORT}`));
