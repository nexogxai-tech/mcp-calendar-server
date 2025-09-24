import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

// MCP tools endpoint
app.get("/mcp/tools", (req, res) => {
  res.json({
    tools: [
      {
        name: "create_reservation",
        description: "Creates a calendar reservation",
        input_schema: {
          type: "object",
          properties: {
            date: { type: "string" },
            time: { type: "string" },
            name: { type: "string" },
          },
          required: ["date", "time", "name"],
        },
      },
    ],
  });
});

// health check
app.get("/", (req, res) => {
  res.send("✅ MCP Server is running!");
});

app.listen(PORT, () => {
  console.log(`MCP server listening on port ${PORT}`);
});
