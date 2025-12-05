import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.CHATGPT_API_KEY,
});

export async function generateDescriptions(input: {
  title: string;
  notes: string;
}) {
  const prompt = `
Generate two things for a deals website:

1) English SEO product description (60–120 words)
2) Spanish SEO product description (60–120 words)
3) English SEO slug (kebab-case, max 100 chars)
4) Spanish SEO slug (kebab-case, max 100 chars)

Product Title: ${input.title}
Product Notes: ${input.notes}
`;

  const response = await openai.chat.completions.create({
    model: "gpt-5-nano",
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.choices[0].message.content || "";

  return text;
}
