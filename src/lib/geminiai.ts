import { GoogleGenerativeAI } from "@google/generative-ai";

const apikey = process.env.NEXT_PUBLIC_GEMINI_API_KEY!;
const genAi = new GoogleGenerativeAI(apikey);

export { genAi };
