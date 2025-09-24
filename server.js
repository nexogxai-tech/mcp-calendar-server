// server.js
const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(bodyParser.json());
app.use(morgan("⚡ GET :url from :remote-addr accept= :req[accept]"));

// Root MCP health endpoint
app.get("/mcp", (req, res) => {
  res.json({
    status: "✅ MCP server is running",
    endpoints: ["/mcp/tools", "/mcp/run/create_reservation"]
  });
});

// Tools endpoint
app.get("/mcp/tools", (req, res) => {
  res.json({
    tools: [
      {
        name: "create_reservation",
        description: "Create a new reservation",
        input_schema: {
          type: "object",
          properties: {
            customer_name: { type: "string" },
            party_size: { type: "number" },
            date: { type: "string" },
            time: { type: "string" },
            notes: { type: "string" }
          },
          required: ["customer_name", "party_size", "date", "time"]
        }
      }
    ]
  });
});

// Run tool
app.post("/mcp/run/create_reservation", (req, res) => {
  const { customer_name, party_size, date, time, notes } = req.body;
  console.log("🎯 POST /mcp/run/create_reservation payload:", req.body);

  res.json({
    success: true,
    message: `Reservation created for ${customer_name}, party of ${party_size}, on ${date} at ${time}. Notes: ${notes || "none"}.`
  });
});

// Catch-all for unknown routes
app.use((req, res) => {
  res.status(404).json({ error: "❌ Endpoint not found" });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 MCP server listening on port ${PORT}`);
});
