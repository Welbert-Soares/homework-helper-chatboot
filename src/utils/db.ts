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

export async function saveGrammarImprovements(
  messageId: string,
  correction: {
    original: string;
    corrected: string;
    focus: string;
  }
) {
  try {
    const { getUser } = await getKindeServerSession();
    const user = await getUser();

    if (!user) {
      throw new Error("User not found");
    }

    const message = await db.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new Error("Message not found");
    }

    const createCorrection = await db.correction.create({
      data: {
        ...correction,
        messageId,
      },
    });

    const updateMessage = await db.message.update({
      where: {
        id: messageId,
      },
      data: {
        improvements: {
          connect: {
            id: createCorrection.id,
          },
        },
      },
    });

    if (!updateMessage) {
      throw new Error("Message not found");
    }

    await db.user.update({
      where: {
        id: user.id,
      },
      data: {
        weaknesses: {
          push: correction.focus,
        },
      },
    });

    revalidatePath(`/chat/${updateMessage.conversationId}`);
  } catch (error) {
    console.error("Error saving grammar improvements:", error);
    throw new Error("Failed to save grammar improvements");
  }
}
