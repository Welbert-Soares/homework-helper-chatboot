import { notFound } from "next/navigation";

import { Chat } from "@/components/Chat";
import { MaxWidthWrapper } from "@/components/common/MaxWidthWrapper";

import { db } from "@/lib/prisma";
import { GrammarImprovements } from "@/components/GrammarImprovements";
import { Correction } from "@/generated/prisma";

interface IParams {
  params: {
    chatId: string;
  };
}

const page = async ({ params }: IParams) => {
  const { chatId } = await params;

  const chat = await db.conversation.findUnique({
    where: {
      id: chatId,
    },
    select: {
      message: {
        include: {
          improvements: true,
        },
      },
    },
  });

  console.log(chat);

  if (!chat) {
    return notFound();
  }

  return (
    <MaxWidthWrapper className="bg-background">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="grid col-span-1 md:col-span-8">
          <Chat initialMessages={chat?.message || []} conversationId={chatId} />
        </div>
        <div className="grid col-span-1 md:col-span-4">
          <GrammarImprovements
            improvements={
              chat.message
                .map((message) => message.improvements)
                .filter(Boolean) as Correction[]
            }
          />
        </div>
      </div>
    </MaxWidthWrapper>
  );
};

export default page;
