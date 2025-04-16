"use server";

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

import { db } from "@/lib/prisma";

import type { Message } from "@/generated/prisma";

import { revalidatePath } from "next/cache";

export async function sendMessageToDB(
  message: string,
  conversationId: string,
  role: string
): Promise<Message | undefined> {
  try {
    const { getUser } = await getKindeServerSession();
    const user = await getUser();

    if (!user) {
      throw new Error("User not found");
    }

    const conversation = await db.conversation.findUnique({
      where: {
        id: conversationId,
        userId: user.id,
      },
    });

    if (!conversation) {
      throw new Error("Conversation not found");
    }

    const newMessage = await db.message.create({
      data: {
        content: message,
        conversationId: conversationId,
        role: role,
      },
    });

    return newMessage;
  } catch (error) {
    console.error("Error saving message:", error);

    return undefined;
  }
}
