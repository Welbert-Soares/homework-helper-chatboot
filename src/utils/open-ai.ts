"use server";

import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

import { openai } from "@/lib/openai";

import type { Message } from "@/generated/prisma";

import { db } from "@/lib/prisma";

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
});

export async function continueConversation(
  messages: Message[],
  message: string
) {
  try {
    const conversationMessages = [
      {
        role: "system",
        content:
          "You are a helpful assistant who converses to help people learn English. Keep your conversational style natural and engaging. Do not correct grammatical errors. Do not answer any questions of a violent nature and any questions that are not related to learning the language, always try to answer with the idea that you are a language assistant and a suggestion for a question related to that.",
      },
      ...messages,
      {
        role: "user",
        content: message,
      },
    ];

    const response = await openai.beta.chat.completions.parse({
      messages: conversationMessages as ChatCompletionMessageParam[],
      model: "gpt-4o-2024-08-06",
      temperature: 0.7,
      response_format: zodResponseFormat(messageSchema, "message"),
    });

    if (!response.choices[0].message.parsed) {
      throw new Error("Failed to parse response");
    }

    return response.choices[0].message.parsed;
  } catch (error) {
    console.error("Error request:", error);
    throw new Error("Failed to complete request");
  }
}
