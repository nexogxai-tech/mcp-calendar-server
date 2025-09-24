import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

// Root dashboard
app.get("/", (req, res) => {
  res.send("MCP Google Calendar Server is running ✅");
});

// MCP endpoint
app.get("/mcp", (req, res) => {
  res.json({
    version: "1.0.0",
    tools: [
      {
        name: "create_event",
        description: "Create a new Google Calendar event",
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
      {
        name: "list_events",
        description: "List Google Calendar events with optional filtering",
      },
      {
        name: "get_event",
        description: "Get details of a specific Google Calendar event",
      },
      {
        name: "update_event",
        description: "Update an existing Google Calendar event",
      },
      {
        name: "delete_event",
        description: "Delete a Google Calendar event",
      },
      {
        name: "list_calendars",
        description: "List all available Google Calendars",
      },
      {
        name: "search_events",
        description: "Search events in Google Calendar",
      },
    ],
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
