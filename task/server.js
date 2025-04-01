const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.post("/suggestions", (req, res) => {
  const { message } = req.body;

  // Simulated ChatGPT suggestion logic
  const suggestions = [
    `Got it, you're asking about: "${message}"`,
    `Let me look into "${message}" and get back to you.`,
    `Can you please clarify what you mean by "${message}"?`
  ];

  res.json({ suggestions });
});

app.listen(PORT, () => {
  console.log(`Mock server running at http://localhost:${PORT}`);
});