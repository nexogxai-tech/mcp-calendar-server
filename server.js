import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ✅ Define your tools object once
const toolsResponse = {
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
          notes: { type: "string" },
        },
        required: ["customer_name", "party_size", "date", "time"],
      },
    },
  ],
};

// ✅ Main MCP endpoint
app.get("/mcp", (req, res) => {
  res.json(toolsResponse);
});

// (Optional) backup endpoint for testing
app.get("/mcp/tools", (req, res) => {
  res.json(toolsResponse);
});

// health check
app.get("/", (req, res) => {
  res.send("✅ MCP Server is running!");
});

app.listen(PORT, () => {
  console.log(`🚀 MCP server listening on port ${PORT}`);
});
