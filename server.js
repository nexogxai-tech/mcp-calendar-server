const express = require("express");
const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/mcp", (req, res) => {
  res.json({
    name: "debug-mcp",
    version: "0.1",
    description: "Minimal MCP debug server",
    endpoints: {
      tools: "/mcp/tools",
      runTool: "/mcp/run/:tool",
    },
  });
});

app.get("/mcp/tools", (req, res) => {
  res.json({
    type: "tool_list",
    tools: [
      {
        name: "ping",
        description: "Simple test tool",
        input_schema: {
          type: "object",
          properties: {
            text: { type: "string" },
          },
          required: ["text"],
        },
      },
    ],
  });
});

app.post("/mcp/run/ping", (req, res) => {
  const { text } = req.body;
  res.json({ success: true, echo: text });
});

app.listen(PORT, () => {
  console.log(`🚀 Debug MCP server running on port ${PORT}`);
});
