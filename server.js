// server.js
import express from "express";
import bodyParser from "body-parser";
import morgan from "morgan";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(morgan("⚡ :method :url from :remote-addr"));

// ✅ Root health-check
app.get("/", (req, res) => {
  res.json({
    message: "✅ MCP Calendar Server is running",
    endpoints: ["/mcp", "/mcp/tools", "/mcp/run/create_reservation"]
  });
});

/**
 * ✅ MCP root endpoint
 * Provides metadata about this MCP server
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
 * ✅ Tool discovery
 * Must return { type: "tool_list", tools: [...] }
 */
app.get("/mcp/tools", (req, res) => {
  res.json({
    type: "tool_list", // 🔑 required for ElevenLabs MCP
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
 * ✅ Tool execution
 * Handles reservation creation
 */
app.post("/mcp/run/create_reservation", (req, res) => {
  const { customer_name, party_size, date, time, notes } = req.body;

  if (!customer_name || !party_size || !date || !time) {
    return res.status(400).json({
      success: false,
      error: "Missing required fields: customer_name, party_size, date, time"
    });
  }

  console.log("🎯 Reservation received:", req.body);

  res.json({
    type: "tool_result", // 🔑 standard MCP response type
    success: true,
    message: `Reservation created for ${customer_name} on ${date} at ${time} for ${party_size} people.`,
    details: { customer_name, party_size, date, time, notes }
  });
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 MCP server listening on port ${PORT}`);
  console.log("     ==> Your service is live 🎉");
});
