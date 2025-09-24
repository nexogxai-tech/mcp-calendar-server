import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()); // Parse JSON bodies

// MCP tools definition
const toolsDefinition = {
  tools: [
    {
      name: "create_reservation",
      description: "Creates a calendar reservation in Google Calendar",
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
};

// Expose MCP tools at /mcp/tools
app.get("/mcp/tools", (req, res) => {
  res.json(toolsDefinition);
});

// Alias: Expose MCP tools also at /mcp (in case the service only looks here)
app.get("/mcp", (req, res) => {
  res.json(toolsDefinition);
});

// MCP action endpoint (called when tool runs)
app.post("/mcp/run/create_reservation", (req, res) => {
  const { customer_name, party_size, date, time, notes } = req.body;

  console.log("📅 New Reservation:", {
    customer_name,
    party_size,
    date,
    time,
    notes,
  });

  res.json({
    success: true,
    message: `Reservation created for ${customer_name} on ${date} at ${time} for ${party_size} guests.`,
  });
});

// Health check
app.get("/", (req, res) => {
  res.send("✅ MCP Server is running!");
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 MCP server listening on port ${PORT}`);
});
