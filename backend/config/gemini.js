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
 * Sends a conversation history to Google AI (Gemini) and retrieves the response.
 * @param {Array} history - Array of message objects: { role: 'user'|'assistant', content: string }
 * @param {string} userMessage - The new user input string
 * @returns {Promise<string>} - The model's response text
 */
export const getAIChatResponse = async (history, userMessage) => {
  try {
    const apiKey = process.env.GOOGLE_AI_API_KEY;

    console.log('Google AI API Check:', {
      exists: !!apiKey,
      length: apiKey?.length || 0,
    });

    if (!apiKey || apiKey.trim().length === 0) {
      throw new Error('GOOGLE_AI_API_KEY is not configured');
    }

    // Format history for DeepSeek (OpenAI-compatible format)
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

    console.log('Sending message to Google AI API:', {
      userMessage,
      historyLength: messages.length,
      endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent'
    });

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: fullMessages.map(msg => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        })),
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 500,
          topP: 1,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Google AI API Error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) {
      throw new Error('No response content from Google AI API');
    }

    console.log('Google AI API response received successfully');
    return responseText;
  } catch (error) {
    console.error('Google AI API Error:', {
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
