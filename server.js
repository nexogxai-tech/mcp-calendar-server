import express from "express";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.json());

// MCP tool definition
app.get("/mcp/tools", (req, res) => {
  res.json({
    tools: [
      {
        name: "create_reservation",
        description: "Book a reservation in Google Calendar",
        parameters: [
          { name: "customer_name", type: "string", required: true },
          { name: "party_size", type: "integer", required: true },
          { name: "date", type: "string", required: true },
          { name: "time", type: "string", required: true },
          { name: "notes", type: "string", required: false }
        ]
      }
    ]
  });
});

// health check
app.get("/", (req, res) => {
  res.send("✅ MCP Server is running!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`MCP server running on ${PORT}`));
