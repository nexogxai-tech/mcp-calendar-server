// -----------------------------
// MCP Router
// -----------------------------
const mcpRouter = express.Router();

mcpRouter.get("/", (req, res) => {
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

mcpRouter.get("/tools", (req, res) => {
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

mcpRouter.post("/run/create_reservation", (req, res) => {
  const { customer_name, party_size, date, time, notes } = req.body;
  console.log("🎯 Reservation received:", req.body);

  res.json({
    success: true,
    message: `Reservation created for ${customer_name} on ${date} at ${time} for ${party_size} people.`,
    details: { customer_name, party_size, date, time, notes }
  });
});

// Mount router
app.use("/mcp", mcpRouter);

