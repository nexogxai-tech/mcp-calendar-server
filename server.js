import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()); // so we can parse JSON bodies

// MCP tools endpoint (tells ElevenLabs what tools exist)
app.get("/mcp/tools", (req, res) => {
  console.log("⚡ ElevenLabs requested /mcp/tools"); // 👈 log whenever ElevenLabs hits it

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

// MCP action endpoint (this is what actually runs when the tool is called)
app.post("/mcp/run/create_reservation", (req, res) => {
  const { customer_name, party_size, date, time, notes } = req.body;

  console.log("📅 New Reservation received:", {
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
  res.send("✅ M
