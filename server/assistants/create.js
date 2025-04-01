const { OpenAI } = require("openai");
require("dotenv").config();

const openai = new OpenAI();

export async function createAssistant() {
  const assistant = await openai.beta.assistants.create({
    instructions:
      "You are helpful assistant that can help with tasks and questions.",
    name: "Helpful Assistant",
    tools: [{ type: "code_interpreter" }],
    model: "gpt-4o-mini",
  });

  return assistant;
}

module.exports = { createAssistant };
