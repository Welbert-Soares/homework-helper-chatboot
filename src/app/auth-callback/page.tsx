import { verifyUser } from "@/app/auth-callback/actions";
import { redirect } from "next/navigation";

const Page = async () => {
  const { success } = await verifyUser();
  if (!success) {
    redirect("/dashboard");
  }

  return (
    <div>
      {!success && "Erro ao criar a conta. Tente novamente mais tarde."}
    </div>
  );
};

export default Page;
