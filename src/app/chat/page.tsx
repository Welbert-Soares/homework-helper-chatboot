import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";

import { db } from "@/lib/prisma";

const Page = async () => {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    redirect("/");
  }

  const dbUser = await db.user.findUnique({
    where: {
      id: user.id,
    },
  });

  if (!dbUser) {
    redirect("/auth-callback");
  }

  const createdChat = await db.conversation.create({
    data: {
      userId: dbUser?.id,
    },
  });

  if (createdChat) {
    redirect(`/chat/${createdChat.id}`);
  }

  return <div>Criando nova conversa.</div>;
};

export default Page;
