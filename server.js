const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const { google } = require("googleapis");

const app = express();
const PORT = process.env.PORT || 10000;

app.use(bodyParser.json());
app.use(morgan("⚡ :method :url from :remote-addr"));

// ✅ Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// ✅ MCP root metadata
app.get("/mcp", (req, res) => {
  res.json({
    type: "server_metadata",
    name: "custom-mcp-server",
    version: "1.0.0",
    description: "MCP server exposing reservation tools connected to Google Calendar",
    endpoints: {
      tools: "/mcp/tools",
      run: "/mcp/run/:tool"
    }
  });
});

// ✅ MCP tools list
app.get("/mcp/tools", (req, res) => {
  res.json({
    type: "tool_list",
    tools: [
      {
        name: "check_availability",
        description: "Check if a date/time is available for a reservation",
        input_schema: {
          type: "object",
          properties: {
            date: { type: "string", format: "date" },
            time: { type: "string" }
          },
          required: ["date", "time"]
        }
      },
      {
        name: "create_reservation",
        description: "Create a reservation in Google Calendar",
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
      },
      {
        name: "cancel_reservation",
        description: "Cancel an existing reservation in Google Calendar",
        input_schema: {
          type: "object",
          properties: {
            reservation_id: { type: "string" }
          },
          required: ["reservation_id"]
        }
      }
    ]
  });
});

// ✅ Tool execution
app.post("/mcp/run/:tool", async (req, res) => {
  const tool = req.params.tool;

  // 👇 Get Google OAuth token passed from ElevenLabs
  const accessToken = req.headers["authorization"]?.replace("Bearer ", "");
  if (!accessToken) {
    return res.status(401).json({ type: "error", message: "Missing Google access token" });
  }

  // Setup Google API client with the provided token
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  const calendar = google.calendar({ version: "v3", auth });

  try {
    switch (tool) {
      case "check_availability": {
        const { date, time } = req.body;

        // Define time range
        const startTime = new Date(`${date}T${time}:00`);
        const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

        const events = await calendar.events.list({
          calendarId: "primary",
          timeMin: startTime.toISOString(),
          timeMax: endTime.toISOString(),
          singleEvents: true,
          orderBy: "startTime"
        });

        const available = events.data.items.length === 0;

        res.json({
          type: "tool_response",
          success: true,
          data: {
            available,
            message: available
              ? `✅ Slot available on ${date} at ${time}`
              : `❌ Slot already booked on ${date} at ${time}`
          }
        });
        break;
      }

      case "create_reservation": {
        const { customer_name, party_size, date, time, notes } = req.body;

        const startTime = new Date(`${date}T${time}:00`);
        const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

        const event = {
          summary: `Reservation for ${customer_name} (party of ${party_size})`,
          description: notes || "",
          start: { dateTime: startTime.toISOString(), timeZone: "UTC" },
          end: { dateTime: endTime.toISOString(), timeZone: "UTC" }
        };

        const created = await calendar.events.insert({
          calendarId: "primary",
          resource: event
        });

        res.json({
          type: "tool_response",
          success: true,
          data: {
            reservation_id: created.data.id,
            summary: created.data.summary
          }
        });
        break;
      }

      case "cancel_reservation": {
        const { reservation_id } = req.body;

        await calendar.events.delete({
          calendarId: "primary",
          eventId: reservation_id
        });

        res.json({
          type: "tool_response",
          success: true,
          data: {
            cancelled: true,
            reservation_id
          }
        });
        break;
      }

      default:
        res.status(404).json({ type: "error", message: `Unknown tool: ${tool}` });
    }
  } catch (err) {
    console.error("❌ Error executing tool:", err);
    res.status(500).json({ type: "error", message: err.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 MCP server running on port ${PORT}`);
});
