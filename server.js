const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()); // parse JSON request bodies

// MCP tools endpoint (tells ElevenLabs what tools exist)
app.get("/mcp/tools", (req, res) => {
  res.json({
    tools: [
      {
        name: "create_reservation",
        description: "Creates a calendar reservation in Google Calendar for Café Amore Bistro",
        input_schema: {
          type: "object",
          properties: {
            customer_name: { type: "string" },
            party_size: { type: "integer" },
            date: { type: "string", format: "date" },
            time: { type: "string" },
            notes: { type: "string" }
          },
          required: ["customer_name", "party_size", "date", "time"]
        }
      }
    ]
  });
});

// MCP action endpoint (this is what runs when ElevenLabs calls the tool)
app.post("/mcp/run/create_reservation", (req, res) => {
  const { customer_name, party_size, date, time, notes } = req.body;

  // For now just log it – later you’ll connect this to Google Calendar
  console.log("📅 New Reservation:", {
    customer_name,
    party_size,
    date,
    time,
    notes
  });

  // Respond back so ElevenLabs knows it worked
  res.json({
    success: true,
    message: `Reservation created for ${customer_name} on ${date} at ${time} for ${party_size} guests.`,
  });
});

// health check
app.get("/", (req, res) => {
  res.send("✅ MCP Server is running!");
});

app.listen(PORT, () => {
  console.log(`🚀 MCP server listening on port ${PORT}`);
});

