import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()); // parse JSON bodies

// MCP tools endpoint
app.get("/mcp/tools", (req, res) => {
  res.json({
    tools: [
      {
        name: "create_reservation",
        description: "Creates a calendar reservation in Google Calendar",
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
  });
});

// MCP action endpoint (runs when the tool is called)
app.post("/mcp/run/create_reservation", (req, res) => {
  const { customer_name, party_size, date, time, notes } = req.body;

  console.log("📅 New Reservation:", {
    customer_name,
    party_size,
    date,
    time,
    notes
  });

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
