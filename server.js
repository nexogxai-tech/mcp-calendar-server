const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const { google } = require("googleapis");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(morgan("⚡ :method :url from :remote-addr"));

// -----------------------------
// MCP Endpoints
// -----------------------------
app.get("/mcp", (req, res) => {
  res.json({
    name: "calendar-server",
    version: "1.0.0",
    description: "MCP server for reservations and calendar tools",
    endpoints: {
      tools: "/mcp/tools",
      runTool: "/mcp/run/:tool"
    }
  });
});

app.get("/mcp/tools", (req, res) => {
  res.json({
    tools: [
      {
        name: "create_reservation",
        description: "Create a reservation in the calendar",
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
      }
    ]
  });
});

app.post("/mcp/run/create_reservation", (req, res) => {
  const { customer_name, party_size, date, time, notes } = req.body;
  console.log("🎯 Reservation received:", req.body);

  res.json({
    success: true,
    message: `Reservation created for ${customer_name} on ${date} at ${time} for ${party_size} people.`,
    details: { customer_name, party_size, date, time, notes }
  });
});

// -----------------------------
// Google OAuth Routes
// -----------------------------
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "https://mcp-calendar-server.onrender.com/oauth2callback" // ✅ Clean domain callback
);

app.get("/", (req, res) => {
  res.send("✅ Google Calendar MCP server is live");
});

app.get("/auth/google", (req, res) => {
  const scopes = ["https://www.googleapis.com/auth/calendar"];
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
  });
  res.redirect(url);
});

app.get("/oauth2callback", async (req, res) => {
  const code = req.query.code;
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  res.send("✅ Google Calendar authorization is complete. You can now use MCP tools.");
});

// -----------------------------
// Start Server
// -----------------------------
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 MCP + Google OAuth server running on port ${PORT}`);
});

