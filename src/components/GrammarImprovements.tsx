"use client";

import { Correction } from "@/generated/prisma";

interface IGrammarImprovements {
  improvements: Correction[];
}

const GrammarImprovements = ({ improvements }: IGrammarImprovements) => {
  return <div></div>;
};

export { GrammarImprovements };
