const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const { google } = require("googleapis");

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(bodyParser.json());
app.use(morgan("⚡ :method :url :status :res[content-length] - :response-time ms"));

// Google OAuth2 setup
const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

oAuth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

const calendar = google.calendar({ version: "v3", auth: oAuth2Client });

/**
 * MCP Root
 */
app.get("/mcp", (req, res) => {
  res.json({
    name: "cafe-amore-mcp",
    version: "1.0.0",
    description: "MCP server for Café Amore Bistro reservation management",
    endpoints: {
      tools: "/mcp/tools",
      runTool: "/mcp/run/:tool",
    },
  });
});

/**
 * MCP Tool Discovery
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
            notes: { type: "string" }
          },
          required: ["customer_name", "party_size", "date", "time"]
        }
      },
      {
        name: "check_availability",
        description: "Check if a timeslot is available in Google Calendar",
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
        name: "cancel_reservation",
        description: "Cancel a reservation by event ID",
        input_schema: {
          type: "object",
          properties: {
            event_id: { type: "string" }
          },
          required: ["event_id"]
        }
      }
    ],
  });
});

/**
 * Tool Execution
 */

// Create Reservation
app.post("/mcp/run/create_reservation", async (req, res) => {
  try {
    const { customer_name, party_size, date, time, notes } = req.body;
    if (!customer_name || !party_size || !date || !time) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }

    const event = {
      summary: `Reservation for ${customer_name} (${party_size} guests)`,
      description: notes || "",
      start: { dateTime: `${date}T${time}:00`, timeZone: "America/New_York" },
      end: { dateTime: `${date}T${time}:00`, timeZone: "America/New_York" },
    };

    const response = await calendar.events.insert({ calendarId: "primary", resource: event });

    res.json({
      success: true,
      message: `Reservation created for ${customer_name}`,
      eventId: response.data.id,
      htmlLink: response.data.htmlLink
    });
  } catch (err) {
    console.error("❌ Create reservation failed:", err.message);
    res.status(500).json({ success: false, error: "Failed to create reservation" });
  }
});

// Check Availability
app.post("/mcp/run/check_availability", async (req, res) => {
  try {
    const { date, time } = req.body;
    if (!date || !time) {
      return res.status(400).json({ success: false, error: "Missing date or time" });
    }

    const start = new Date(`${date}T${time}:00Z`);
    const end = new Date(start.getTime() + 60 * 60 * 1000); // default 1h slot

    const events = await calendar.events.list({
      calendarId: "primary",
      timeMin: start.toISOString(),
      timeMax: end.toISOString(),
      singleEvents: true,
      orderBy: "startTime",
    });

    if (events.data.items.length > 0) {
      res.json({ available: false, message: "Timeslot is booked", events: events.data.items });
    } else {
      res.json({ available: true, message: "

