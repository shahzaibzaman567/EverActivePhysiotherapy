import dotenv from 'dotenv';

dotenv.config();

const SYSTEM_INSTRUCTION = `
You are "EverActive Care AI", the dedicated virtual assistant for EverActive Physiotherapy.

YOUR SCOPE & CAPABILITIES:
1. Explain clinic services: Mobile Home Physiotherapy, Care Home Group Sessions, Sports Physiotherapy & Rehab, Community Physiotherapy Group Classes, and Mobile Physio-Led Personal Training.
2. Tell users about our details: Hours (Monday to Friday, 8:00 AM - 6:00 PM; Saturday & Sunday: Closed), Location (67 Windsor Road, Prestwich, Manchester, M250DB), and Contact info (Phone/WhatsApp: +44 7542 221845, Email: everactivephysiotherapy@gmail.com).
3. Guide users on how to book an appointment (Login required -> Go to Doctors -> Select Doctor & Time Slot -> Confirm).
4. Explain how reviews, ratings, and testimonials work.

CRITICAL SAFETY DIRECTIVES (MANDATORY):
1. NO MEDICAL DIAGNOSIS: If a user describes physical symptoms (e.g. "my shoulder hurts when I raise it, what is it?"), do NOT name specific conditions or diagnose them. Suggest they book an assessment with our qualified physiotherapists.
2. NO PRESCRIPTIONS: Never suggest specific drugs, medicines, dosages, or self-treatment regimes.
3. NO EMERGENCY ADVICE: If the user indicates extreme pain, numbness, chest pain, difficulty breathing, or severe accidents, tell them to call emergency services immediately.
4. CLINIC FOCUS ONLY: If the user asks about unrelated topics (e.g. general knowledge, programming, cooking, coding, other medical specialties like cardiology), politely refuse, stating you can only assist with physiotherapy-related queries at EverActive.
5. ESCALATION: Politely but firmly redirect the user to schedule an in-clinic appointment for personalized assessment if they ask complex, diagnostic, or deep medical questions.

Keep your responses friendly, concise, and structured (use bullet points where appropriate).
`;

/**
 * Sends a conversation history to OpenRouter API (OpenAI-compatible) and retrieves the response.
 * @param {Array} history - Array of message objects: { role: 'user'|'assistant', content: string }
 * @param {string} userMessage - The new user input string
 * @returns {Promise<string>} - The model's response text
 */
export const getAIChatResponse = async (history, userMessage) => {
  try {
    // Support both OPENROUTER_API_KEY and GOOGLE_AI_API_KEY for backwards compatibility
    const apiKey = process.env.OPENROUTER_API_KEY || process.env.GOOGLE_AI_API_KEY;

    console.log('AI API Key Check:', {
      hasOpenRouter: !!process.env.OPENROUTER_API_KEY,
      hasGoogleAI: !!process.env.GOOGLE_AI_API_KEY,
      resolved: !!apiKey,
      length: apiKey?.length || 0,
    });

    if (!apiKey || apiKey.trim().length === 0) {
      throw new Error('AI API key (OPENROUTER_API_KEY or GOOGLE_AI_API_KEY) is not configured');
    }

    // Format history for OpenRouter (OpenAI-compatible format)
    const messages = (history || []).map((msg) => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content || '',
    }));

    // Add system instruction
    const fullMessages = [
      {
        role: 'system',
        content: SYSTEM_INSTRUCTION,
      },
      ...messages,
      {
        role: 'user',
        content: userMessage,
      },
    ];

    console.log('Sending message to AI API:', {
      userMessage: userMessage.substring(0, 50) + '...',
      historyLength: messages.length,
      endpoint: 'https://openrouter.ai/api/v1/chat/completions',
      model: 'openai/gpt-3.5-turbo'
    });

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://everactivephysiotherapy.com',
        'X-Title': 'EverActive Physiotherapy',
      },
      body: JSON.stringify({
        model: 'openai/gpt-3.5-turbo',
        messages: fullMessages,
        temperature: 0.2,
        max_tokens: 500,
        top_p: 1,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`AI API Error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const responseText = data?.choices?.[0]?.message?.content;

    if (!responseText) {
      throw new Error('No response content from AI API');
    }

    console.log('AI API response received successfully');
    return responseText;
  } catch (error) {
    console.error('AI API Error:', {
      message: error.message,
      name: error.name,
      code: error.code || error.response?.status,
      timestamp: new Date().toISOString()
    });
    
    // Safe backup response
    if (userMessage.toLowerCase().includes('diagnos') || (userMessage.toLowerCase().includes('pain') && userMessage.length > 50)) {
      return "For safety reasons, I cannot offer medical advice or diagnoses. I strongly recommend booking an appointment with one of our physical therapists at EverActive for a thorough assessment.";
    }
    return "I'm sorry, I'm having trouble connecting to my knowledge base right now. Please feel free to book an appointment online, or call us directly for assistance!";
  }
};
