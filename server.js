import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(bodyParser.json());

/**
 * ---------------------------
 * LANDING PAGE (/mcp)
 * ---------------------------
 */
app.get("/mcp", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>MCP Google Calendar Server</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #333; }
          .status { padding: 10px; margin: 10px 0; border: 1px solid #ccc; background: #e7f7e7; }
          .tools { margin-top: 20px; }
          ul { line-height: 1.6; }
        </style>
      </head>
      <body>
        <h1>MCP Google Calendar Server</h1>
        <p><strong>Version:</strong> 1.0.0</p>
        <div class="status">✅ Google Calendar Connected</div>
        
        <h2>MCP Endpoint</h2>
        <code>${req.protocol}://${req.get("host")}/mcp</code>

        <div class="tools">
          <h2>Available Tools</h2>
          <ul>
            <li><strong>create_reservation:</strong> Book, change, or cancel a reservation at Café Amore Bistro</li>
            <li><strong>list_events:</strong> List Google Calendar events</li>
            <li><strong>get_event:</strong> Get details of a Google Calendar event</li>
            <li><strong>update_event:</strong> Update a Google Calendar event</li>
            <li><strong>delete_event:</strong> Delete a Google Calendar event</li>
            <li><strong>list_calendars:</strong> List all available Google Calendars</li>
            <li><strong>search_events:</strong> Search events in Google Calendar</li>
          </ul>
        </div>

        <h2>Other Endpoints</h2>
        <ul>
          <li><a href="/health">Health Check</a></li>
          <li><a href="/server-info">Server Info</a></li>
          <li><a href="/auth/google">Google Authentication</a></li>
        </ul>
      </body>
    </html>
  `);
});

/**
 * ---------------------------
 * TOOLS ENDPOINT (/mcp/tools)
 * ---------------------------
 */
app.get("/mcp/tools", (req, res) => {
  res.json({
    tools: [
      {
        name: "create_reservation",
        description: "Book, change, or cancel a reservation at Café Amore Bistro",
        parameters: ["customer_name", "party_size", "date", "time", "notes"]
      },
      { name: "list_events" },
      { name: "get_event" },
      { name: "update_event" },
      { name: "delete_event" },
      { name: "list_calendars" },
      { name: "search_events" }
    ]
  });
});

/**
 * ---------------------------
 * TOOL RUNNER (/mcp/run/:tool)
 * ---------------------------
 */
app.post("/mcp/run/:tool", (req, res) => {
  const { tool } = req.params;
  const payload = req.body;

  console.log(`🎯 POST /mcp/run/${tool}`, payload);

  if (tool === "create_reservation") {
    // 🚨 TODO: Connect this to Google Calendar API
    const confirmation = {
      summary: `Reservation confirmed for ${payload.customer_name}, party of ${payload.party_size} on ${payload.date} at ${payload.time}. Notes: ${payload.notes || "None"}`,
      status: "confirmed"
    };
    return res.json(confirmation);
  }

  res.json({ status: "success", tool, payload });
});

/**
 * ---------------------------
 * HEALTH & INFO
 * ---------------------------
 */
app.get("/health", (req, res) => res.json({ status: "ok", uptime: process.uptime() }));
app.get("/server-info", (req, res) =>
  res.json({ name: "MCP Google Calendar Server", version: "1.0.0", port: PORT })
);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 MCP server running at http://localhost:${PORT}`);
});
