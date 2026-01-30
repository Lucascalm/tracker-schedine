import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { context } = await req.json();

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!apiKey) {
      console.warn('GOOGLE_GENERATIVE_AI_API_KEY not set. Returning mock response.');
      // Return a mock response so the UI doesn't break
      return new Response("Simulazione Analisi (API Key mancante):\n\n**Analisi Strategica**\nIl tuo bankroll mostra una crescita costante, indicando una buona gestione dello stake.\n\n* **Punto di forza:** Ottima resilienza nei periodi di drawdown.\n* **Rischio:** Attenzione a non aumentare troppo lo stake dopo le serie vincenti.\n\n_Nota: Configura la API Key per ottenere analisi reali._", {
        status: 200,
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    const systemPrompt = `
      ROLE: Senior Risk Manager & Betting Analyst.
      TONE: Professional, analytical, cold but encouraging if results are good. Concise.
      
      OBJECTIVE: Analyze the user's betting bankroll trend provided in the context.
      
      OUTPUT RULES:
      1. Start with a direct strategic insight (e.g., "Good volatility management...", "Warning: Drawdown is too high...").
      2. Mention 1 key strength and 1 key risk using the provided data.
      3. Keep it under 50 words. Use bullet points if needed.
      4. Use formatting: **Bold** for key numbers.
      
      CONTEXT DATA:
      ${context}
    `;

    const result = await streamText({
      model: google('gemini-2.0-flash'), // Updated to current free tier model
      system: systemPrompt,
      prompt: "Analyze my performance based on the specific context data provided.",
    });

    return result.toTextStreamResponse();
  } catch (error: any) {
    console.error('AI Error:', error?.message || error);

    // Check if it's a rate limit or quota error
    const isQuotaError = error?.message?.includes('429') ||
      error?.message?.includes('quota') ||
      error?.message?.includes('RESOURCE_EXHAUSTED') ||
      error?.statusCode === 429;

    if (isQuotaError) {
      // Return a graceful fallback instead of an error
      return new Response(
        "⏳ **Analisi AI temporaneamente non disponibile**\n\n" +
        "Il servizio AI ha raggiunto il limite di richieste. Riprova tra qualche minuto.\n\n" +
        "**Nel frattempo, ecco un consiglio generale:**\n" +
        "Mantieni una gestione del bankroll disciplinata, non superare mai il 2-5% del capitale per singola giocata.",
        { status: 200, headers: { 'Content-Type': 'text/plain' } }
      );
    }

    const errorMessage = error?.message || 'Errore sconosciuto';
    return new Response(`Errore AI: ${errorMessage}`, { status: 500 });
  }
}
