"use server";

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

import { db } from "@/lib/prisma";

export const verifyUser = async () => {
  try {
    const { getUser } = await getKindeServerSession();
    const user = await getUser();

    if (!user) {
      return { success: false };
    }

    const dbUser = await db.user.findUnique({
      where: {
        id: user.id,
      },
    });

    if (!dbUser) {
      await db.user.create({
        data: {
          id: user.id,
          email: user.email!,
          name: user.given_name + " " + user.family_name,
        },
      });
      return { success: true };
    }

    return { success: true };
  } catch (error) {
    console.error("Error verifying user:", error);
    return { success: false };
  }
};
