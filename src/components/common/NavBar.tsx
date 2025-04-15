import Link from "next/link";
import { MenuIcon } from "lucide-react";
import {
  LoginLink,
  LogoutLink,
  RegisterLink,
} from "@kinde-oss/kinde-auth-nextjs/components";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button, buttonVariants } from "@/components/ui/button";
import { MaxWidthWrapper } from "@/components/common/MaxWidthWrapper";

const navigatiion = [
  {
    name: "Início",
    href: "/",
  },
  {
    name: "Dashboard",
    href: "/dashboard",
  },
];

const NavBar = async () => {
  const { isAuthenticated } = await getKindeServerSession();
  const authenticated = await isAuthenticated();

  return (
    <MaxWidthWrapper className="fixed top-0 w-full z-50 right-0 left-0 bg-background/80 backdrop-blur-md shadow-sm">
      <nav className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:20 ">
          <Link href={"/"} className="font-bold">
            LOGO
          </Link>
          <div className="hidden md:flex items-center space-x-8">
            {navigatiion.map((item, i) => (
              <Link
                key={i}
                href={item.href}
                className="text-muted-foreground hover;text-foreground transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </div>
          {authenticated ? (
            <LogoutLink>Sair</LogoutLink>
          ) : (
            <div className="hidden md:flex items-center space-x-4">
              <LoginLink
                className={buttonVariants({
                  variant: "ghost",
                })}
              >
                Entrar
              </LoginLink>
              <RegisterLink
                className={buttonVariants({
                  className:
                    "bg-primary text-primary-foreground hover:bg-primary/90",
                })}
              >
                Registrar-se
              </RegisterLink>
            </div>
          )}
          <div className="md:hidden">
            <Sheet>
              <SheetTitle className="font-bold">LOGO</SheetTitle>
              <SheetTrigger>
                <Button variant={"ghost"} size={"icon"}>
                  <MenuIcon className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side={"right"} className="w-[300px] sm:w-[400px]">
                {navigatiion.map((item, i) => (
                  <Link
                    key={i}
                    href={item.href}
                    className="text-foreground hover:text-primary transition-colors px-4 py-2 rounded-lg hover:bg-accent/10"
                  >
                    {item.href}
                  </Link>
                ))}
                <div className="flex flex-col space-y-4 pt-4 border-t border-border">
                  <LoginLink
                    className={buttonVariants({
                      variant: "ghost",
                    })}
                  >
                    Entrar
                  </LoginLink>
                  className{" "}
                  <RegisterLink
                    className={buttonVariants({
                      className:
                        "bg-primary text-primary-foreground hover:bg-primary/90",
                    })}
                  >
                    Entrar
                  </RegisterLink>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </MaxWidthWrapper>
  );
};

export { NavBar };
