import OpenAI from "openai";

const openai = new OpenAI();

const assistantId = process.env.OPENAI_ASSISTANT_ID;

export async function updateAssistant(instructions, name) {
  const myUpdatedAssistant = await openai.beta.assistants.update(assistantId, {
    instructions: instructions,
    name: name,
    tools: [{ type: "file_search" }],
    model: "gpt-4o-mini",
  });

  return myUpdatedAssistant;
}

module.exports = { updateAssistant };
