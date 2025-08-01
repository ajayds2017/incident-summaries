const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY, // Set this as GitHub Secret
});
const openai = new OpenAIApi(configuration);

const summary = await openai.createChatCompletion({
  model: "gpt-4",
  messages: [
    {
      role: "system",
      content: "Summarize this incident in simple terms.",
    },
    {
      role: "user",
      content: `${incident.title}: ${incident.description}`
    }
  ]
});
