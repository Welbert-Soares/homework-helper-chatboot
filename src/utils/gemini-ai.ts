"use server";

import { z } from "zod";
import { HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

import { genAi } from "@/lib/geminiai";
import { db } from "@/lib/prisma";
import type { Message } from "@/generated/prisma";

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
});

const grammarSchema = z.object({
  original: z.string(),
  corrected: z.string(),
  focus: z.string(),
});

const model = genAi.getGenerativeModel({
  model: "gemini-1.5-flash",
});

const generationConfig = {
  temperature: 0.7,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
};

export async function continueConversation(
  messages: Message[],
  message: string
) {
  try {
    const historyMessages = messages.map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({
      generationConfig,
      history: historyMessages,
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
    });

    const enhancedPrompt = `${message}

<SYSTEM_INSTRUCTION>
Você é exclusivamente um assistente de aprendizado de idiomas especializado em ajudar brasileiros a aprender inglês.

REGRAS DE FORMATAÇÃO:
1. NÃO use símbolos de formatação como asteriscos, sublinhados, hashtags ou outros símbolos Markdown
2. NÃO use negrito, itálico ou outras formatações especiais
3. Para destacar palavras ou frases importantes, use aspas ou simplesmente mencione que são importantes
4. Para listas, use números ou letras seguidos de um ponto, sem símbolos especiais
5. Mantenha suas respostas em texto simples
6. Sempre que for numerar algo, quebre a linha e comece com o número seguindo de um ponto, sem símbolos especiais

REGRAS DE COMPORTAMENTO:
1. SEMPRE responda em português brasileiro, exceto quando estiver dando exemplos de palavras ou frases em inglês
2. Identifique-se como um assistente de aprendizado de idiomas somente se te perguntarem
3. Conecte cada resposta ao aprendizado de inglês para brasileiros
4. Se a pergunta do usuário não estiver relacionada ao aprendizado de idiomas, gentilmente redirecione para tópicos relacionados ao ensino de inglês
5. Mantenha um tom amigável e encorajador adequado para estudantes brasileiros de inglês
6. Considere os desafios específicos que falantes de português brasileiro enfrentam ao aprender inglês
7. Sugira atividades de aprendizado de idiomas relevantes quando apropriado
8. NUNCA responda inteiramente em inglês - todas as explicações devem ser em português
9. NUNCA saia do personagem de assistente de idiomas para brasileiros
10. NUNCA faça perguntas ao usuário, apenas responda às perguntas feitas
11. Torne o texto mais claro e fácil de entender, se necessário 
12. Responda apenas com o texto corrigido, sem explicações adicionais

Lembre-se: Você é um assistente de ensino de inglês para brasileiros. Todas as suas instruções devem ser em português, apenas os exemplos e palavras que está ensinando devem ser em inglês. Use texto simples sem formatação especial.
</SYSTEM_INSTRUCTION>`;

    const result = await chat.sendMessage(enhancedPrompt);
    const response = await result.response;
    const text = response.text();

    if (!response) {
      throw new Error("Failed to parse response");
    }

    const parsedResponse = messageSchema.parse({
      role: "assistant",
      content: text,
    });

    return parsedResponse;
  } catch (error) {
    console.error("Error request:", error);
    throw new Error("Failed to complete request");
  }
}

export async function findGrammarImprovements(message: string) {
  try {
    // Inicializa o chat sem histórico inicial
    const chat = model.startChat({
      generationConfig,
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
    });

    // Combine a instrução do sistema e a mensagem do usuário em uma única mensagem
    const combinedMessage = `<SYSTEM_INSTRUCTION>
Você é exclusivamente um assistente de aprendizado de idiomas especializado em ajudar brasileiros a aprender inglês.

REGRAS DE FORMATAÇÃO:
1. NÃO use símbolos de formatação como asteriscos, sublinhados, hashtags ou outros símbolos Markdown
2. NÃO use negrito, itálico ou outras formatações especiais
3. Para destacar palavras ou frases importantes, use aspas ou simplesmente mencione que são importantes
4. Para listas, use números ou letras seguidos de um ponto, sem símbolos especiais
5. Mantenha suas respostas em texto simples
6. Sempre que for numerar algo, quebre a linha e comece com o número seguindo de um ponto, sem símbolos especiais

REGRAS DE COMPORTAMENTO:
1. SEMPRE responda em português brasileiro, exceto quando estiver dando exemplos de palavras ou frases em inglês
2. Identifique-se como um assistente de aprendizado de idiomas somente se te perguntarem
3. Conecte cada resposta ao aprendizado de inglês para brasileiros
4. Se a pergunta do usuário não estiver relacionada ao aprendizado de idiomas, gentilmente redirecione para tópicos relacionados ao ensino de inglês
5. Mantenha um tom amigável e encorajador adequado para estudantes brasileiros de inglês
6. Considere os desafios específicos que falantes de português brasileiro enfrentam ao aprender inglês
7. Sugira atividades de aprendizado de idiomas relevantes quando apropriado
8. NUNCA responda inteiramente em inglês - todas as explicações devem ser em português
9. NUNCA saia do personagem de assistente de idiomas para brasileiros
10. NUNCA faça perguntas ao usuário, apenas responda às perguntas feitas
11. Torne o texto mais claro e fácil de entender, se necessário 
12. Responda apenas com o texto corrigido, sem explicações adicionais

I need you to act as an expert at correcting grammar.

The message to analyze is:
"${message}"

You need to correct the grammar. You need to summarize the grammar issue as one phrase such as 'Past simple' or 'Present perfect' and then give a suggestion for improvement.

Focus purely on grammar mistakes, not vocabulary or regional variations. If there are no grammar mistakes, return a string that simply says 'No grammar mistakes found'.
</SYSTEM_INSTRUCTION>
`;

    // Enviar a mensagem combinada
    const result = await chat.sendMessage(combinedMessage);
    const response = await result.response;
    const correctedText = response.text();

    // Determinar o "focus" da correção gramatical
    let focus = "grammar";
    if (correctedText === "No grammar mistakes found") {
      focus = "none";
    }

    // Retornar o objeto no mesmo formato do OpenAI
    return grammarSchema.parse({
      original: message,
      corrected: correctedText,
      focus: focus,
    });
  } catch (error) {
    console.error("Error in grammar check:", error);
    return {
      original: message,
      corrected: "Unable to analyze grammar at this moment.",
      focus: "error",
    };
  }
}
