// server.js
const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const { google } = require("googleapis");

const app = express();
const PORT = process.env.PORT || 10000;

app.use(bodyParser.json());
app.use(morgan("⚡ :method :url from :remote-addr"));

// Google Calendar setup
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);
oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
const calendar = google.calendar({ version: "v3", auth: oauth2Client });

/**
 * MCP Root
 */
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

/**
 * MCP Tools
 */
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

/**
 * Create Reservation
 */
app.post("/mcp/run/create_reservation", async (req, res) => {
  try {
    const { customer_name, party_size, date, time, notes } = req.body;
    const startDateTime = new Date(`${date}T${time}:00`);
    const endDateTime = new Date(startDateTime.getTime() + 2 * 60 * 60 * 1000); // 2hr block

    const event = {
      summary: `Reservation for ${customer_name} (${party_size})`,
      description: notes || "",
      start: { dateTime: startDateTime.toISOString(), timeZone: "America/New_York" },
      end: { dateTime: endDateTime.toISOString(), timeZone: "America/New_York" },
    };

    const response = await calendar.events.insert({
      calendarId: "primary",
      resource: event,
    });

    res.json({
      success: true,
      message: `Reservation created for ${customer_name} on ${date} at ${time}.`,
      eventId: response.data.id,
    });
  } catch (error) {
    console.error("❌ Error creating reservation:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Check Availability
 */
app.post("/mcp/run/check_availability", async (req, res) => {
  try {
    const { date, time } = req.body;
    const startDateTime = new Date(`${date}T${time}:00`);
    const endDateTime = new Date(startDateTime.getTime() + 2 * 60 * 60 * 1000);

    const events = await calendar.events.list({
      calendarId: "primary",
      timeMin: startDateTime.toISOString(),
      timeMax: endDateTime.toISOString(),
      singleEvents: true,
      orderBy: "startTime",
    });

    if (events.data.items.length > 0) {
      res.json({
        available: false,
        message: `Sorry, ${date} at ${time} is already booked.`,
      });
    } else {
      res.json({
        available: true,
        message: `Good news! ${date} at ${time} is available.`,
      });
    }
  } catch (error) {
    console.error("❌ Error checking availability:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Cancel Reservation
 */
app.post("/mcp/run/cancel_reservation", async (req, res) => {
  try {
    const { eventId } = req.body;
    await calendar.events.delete({
      calendarId: "primary",
      eventId: eventId,
    });

    res.json({
      success: true,
      message: `Reservation with ID ${eventId} has been canceled.`,
    });
  } catch (error) {
    console.error("❌ Error canceling reservation:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Cafe Amore MCP server listening on port ${PORT}`);
});
