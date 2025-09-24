const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");

const app = express();
const PORT = process.env.PORT || 10000;

app.use(bodyParser.json());
app.use(morgan("⚡ :method :url from :remote-addr"));

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// MCP root
app.get("/mcp", (req, res) => {
  res.json({
    name: "cafe-amore-mcp",
    version: "1.0.0",
    description: "MCP server for Café Amore Bistro reservations",
    endpoints: {
      tools: "/mcp/tools",
      runTool: "/mcp/run/:tool",
    },
  });
});

// MCP tools list
app.get("/mcp/tools", (req, res) => {
  res.json({
    type: "tool_list",
    tools: [
      {
        name: "create_reservation",
        description: "Create a reservation in Google Calendar",
        input_schema: {
          type: "object",
          properties: {
            customer_name: { type: "string" },
            party_size: { type: "number" },
            date: { type: "string", format: "date" },
            time: { type: "string" },
            notes: { type: "string" },
          },
          required: ["customer_name", "party_size", "date", "time"],
        },
      },
      {
        name: "check_availability",
        description: "Check if a time slot is available in Google Calendar",
        input_schema: {
          type: "object",
          properties: {
            date: { type: "string", format: "date" },
            time: { type: "string" },
          },
          required: ["date", "time"],
        },
      },
      {
        name: "cancel_reservation",
        description: "Cancel a reservation in Google Calendar",
        input_schema: {
          type: "object",
          properties: {
            eventId: { type: "string" },
          },
          required: ["eventId"],
        },
      },
    ],
  });
});

// Stubbed tool execution
app.post("/mcp/run/create_reservation", (req, res) => {
  const { customer_name, party_size, date, time, notes } = req.body;
  res.json({
    success: true,
    message: `Reservation created for ${customer_name} on ${date} at ${time} for ${party_size} people.`,
    details: { customer_name, party_size, date, time, notes },
  });
});

app.post("/mcp/run/check_availability", (req, res) => {
  const { date, time } = req.body;
  res.json({
    available: true,
    message: `Checked availability for ${date} at ${time} (stubbed response).`,
  });
});

app.post("/mcp/run/cancel_reservation", (req, res) => {
  const { eventId } = req.body;
  res.json({
    success: true,
    message: `Reservation with ID ${eventId} has been canceled (stubbed response).`,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Cafe Amore MCP server listening on port ${PORT}`);
});
