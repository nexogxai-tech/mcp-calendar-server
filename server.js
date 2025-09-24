// server.js
const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(bodyParser.json());
app.use(morgan("⚡ :method :url :status :res[content-length] - :response-time ms"));

/**
 * Root MCP endpoint
 */
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

/**
 * MCP Tool Discovery
 */
app.get("/mcp/tools", (req, res) => {
  res.json({
    type: "tool_list",
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

/**
 * MCP Tool Execution
 */
app.post("/mcp/run/create_reservation", (req, res) => {
  try {
    const { customer_name, party_size, date, time, notes } = req.body;

    if (!customer_name || !party_size || !date || !time) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: customer_name, party_size, date, time"
      });
    }

    console.log("🎯 Reservation request:", req.body);

    res.json({
      success: true,
      message: `Reservation created for ${customer_name} on ${date} at ${time} for ${party_size} people.`,
      details: { customer_name, party_size, date, time, notes }
    });
  } catch (err) {
    console.error("❌ Error handling reservation:", err);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
});

/**
 * Fallback 404 handler
 */
app.use((req, res) => {
  res.status(404).json({
    error: "Not found",
    path: req.originalUrl
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 MCP server listening on port ${PORT}`);
  console.log("     ==> Service is live 🎉");
});
