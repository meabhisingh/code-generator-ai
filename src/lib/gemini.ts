import { gemini } from "../app";

const generateText = async (prompt: string = "Generate a sample title") => {
  try {
    // For text-only input, use the gemini-pro model
    const model = gemini.getGenerativeModel({
      model: "gemini-pro",
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return text;
  } catch (error) {
    throw error;
  }
};

export { generateText };
