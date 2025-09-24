const express = require("express");
const morgan = require("morgan");

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());
app.use(morgan("dev"));

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// MCP metadata root
app.get("/mcp", (req, res) => {
  res.json({
    type: "server_metadata",
    name: "custom-mcp-server",
    version: "1.0.0",
    description: "MCP server exposing reservation tools",
    endpoints: {
      tools: "/mcp/tools",
      run: "/mcp/run/:tool"
    }
  });
});

// Tool discovery
app.get("/mcp/tools", (req, res) => {
  res.json({
    type: "tool_list",
    tools: [
      {
        name: "check_availability",
        description: "Check if a time slot is available",
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
        description: "Create a new reservation",
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
        name: "cancel_reservation",
        description: "Cancel an existing reservation",
        input_schema: {
          type: "object",
          properties: {
            event_id: { type: "string" }
          },
          required: ["event_id"]
        }
      }
    ]
  });
});

// Run tool endpoint (dummy for now)
app.post("/mcp/run/:tool", (req, res) => {
  const { tool } = req.params;
  const input = req.body;

  res.json({
    type: "tool_response",
    tool,
    received: input,
    note: "This is a dummy response — Google integration not wired yet"
  });
});

app.listen(PORT, () => {
  console.log(`🚀 MCP server running on port ${PORT}`);
});
