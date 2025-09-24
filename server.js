import express from "express";

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json()); // Parse JSON bodies

// 🛠 /mcp endpoint (always JSON)
app.get("/mcp", (req, res) => {
  console.log("⚡ GET /mcp");
  res.type("application/json");
  res.json({
    status: "✅ MCP server is running",
    endpoints: ["/mcp/tools", "/mcp/run/create_reservation"],
  });
});

// 🛠 /mcp/tools (tool discovery for ElevenLabs or others)
app.get("/mcp/tools", (req, res) => {
  console.log("⚡ GET /mcp/tools");
  res.type("application/json");
  res.json({
    tools: [
      {
        name: "create_reservation",
        description:
          "Creates a calendar reservation in Google Calendar for Café Amore Bistro",
        input_schema: {
          type: "object",
          properties: {
            customer_name: { type: "string" },
            party_size: { type: "integer" },
            date: { type: "string", format: "date" },
            time: { type: "string" },
            notes: { type: "string" },
          },
          required: ["customer_name", "party_size", "date", "time"],
        },
      },
    ],
  });
});

// 🛠 /mcp/run/create_reservation (simulate tool execution)
app.post("/mcp/run/create_reservation", (req, res) => {
  const { customer_name, party_size, date, time, notes } = req.body;

  console.log("🎯 POST /mcp/run/create_reservation payload:", req.body);

  // (Later: connect this to Google Calendar API)
  res.type("application/json");
  res.json({
    success: true,
    message: `Reservation created for ${customer_name} on ${date} at ${time} for ${party_size} guests.`,
    data: { customer_name, party_size, date, time, notes },
  });
});

// 🩺 Health check (root)
app.get("/", (req, res) => {
  console.log("⚡ GET /");
  res.type("application/json");
  res.json({ status: "ok", message: "✅ MCP server is live" });
});

// 🚀 Start server
app.listen(PORT, () => {
  console.log(`🚀 MCP server listening on port ${PORT}`);
});
