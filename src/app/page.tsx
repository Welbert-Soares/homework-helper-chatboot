import { SquarePlayIcon } from "lucide-react";

import { MaxWidthWrapper } from "@/components/common/MaxWidthWrapper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function Home() {
  return (
    <MaxWidthWrapper className="overflow-x-hidden mt-8 md:mt-12">
      <section className="relative">
        <div className="hidden sm:block absolute top-0 right-0 w-2/3 h-full bg-white transform skew-x-12 translate-x-32 sm:translate-x-20 z-0" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-8">
            <div className="w-full md:w-1/2 space-y-4 sm:space-y6 text-center md:text-left">
              <Badge className="bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 inline-flex">
                Estude com seu proprio assistente pessoal
              </Badge>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-indigo-900 leading-tight">
                Aprenda{" "}
                <span className="relative">
                  <span className="relative z-10">Conversando</span>
                  <span className="absolute bottom-2 left-0 w-full h-4 bg-orange-500/30 -rotate-2" />
                </span>
              </h1>
              <p className="text-base sm:text-lg text-gray-700 w-full md:max-w-md mx-auto md:mx-0">
                Domine qualquer idioma naturalmente com nossos chatbots de IA.
                Receba feedback instantâneo enquanto escreve e conversa.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-center md:justify-start">
                <Button className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 transform hover:scale-105 transition-all shadow-lg">
                  Comece Agora
                </Button>
                <Button
                  variant={"ghost"}
                  className="w-full sm:w-auto text-indigo-700 hover:text-indigo-800 hover:bg-transparent"
                >
                  <div className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center mr-2">
                    <SquarePlayIcon strokeWidth={4} />
                  </div>
                  Veja Como Funciona
                </Button>
              </div>
            </div>

            <Image
              src="/bg.jpg"
              alt="classroom"
              width={400}
              height={400}
              className="relative z-10 rounded-2xl shadow-2xl transform hover:rotate-2 transition-transform duration-300 w-full"
            />
          </div>
        </div>
      </section>
    </MaxWidthWrapper>
  );
}
