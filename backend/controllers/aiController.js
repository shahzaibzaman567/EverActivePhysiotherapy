import { getAIChatResponse } from '../config/gemini.js';

/* ─────────────────────────────────────────────────────────────────────────
   EverActive Care AI — Smart Rule-Based Fallback Engine
   Works fully without a Gemini API key. Gemini is tried first; if it
   fails for any reason this engine replies instantly.
───────────────────────────────────────────────────────────────────────── */

const CLINIC = {
  name:    'EverActive Physiotherapy',
  phone:   '+44 7542 221845',
  email:   'everactivephysiotherapy@gmail.com',
  address: '67 Windsor Road, Prestwich, Manchester, M25 0DB',
  hours:   'Monday – Friday: 8:00 AM – 6:00 PM | Saturday & Sunday: Closed',
  facebook:'https://web.facebook.com/p/EverActive-Physiotherapy-61577801432024/',
};

const SERVICES = [
  { key: ['home', 'mobile', 'visit'],           name: 'Mobile Home Physiotherapy',        desc: 'We bring professional physiotherapy directly to your home with all necessary equipment. No travel needed.' },
  { key: ['care home', 'carehome', 'resident', 'group session'], name: 'Care Home Group Sessions', desc: 'Specialist group exercise & mobility sessions for care home residents — safe, engaging, and proven to improve morale.' },
  { key: ['community', 'class', 'fall', 'prevention'], name: 'Community Group Classes',  desc: 'Inclusive group physio classes in community centres. Focus on fall prevention, strength, and independence.' },
  { key: ['sport', 'athlete', 'acl', 'injury', 'rehab', 'football', 'rugby'], name: 'Sports Physio & Rehab', desc: 'Elite injury assessment, acute management, and return-to-play conditioning for athletes at all levels.' },
  { key: ['personal training', 'pt', 'fitness', 'strength', 'conditioning'], name: 'Mobile Physio-Led Personal Training', desc: 'Physio-led personal training tailored to your goals — strength, fitness, and movement under expert guidance.' },
];

const RULES = [
  // Greetings
  { match: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'salaam', 'assalam'],
    reply: `👋 Hello! Welcome to **EverActive Physiotherapy AI**.\n\nI can help you with:\n- Our services & treatments\n- Booking appointments\n- Clinic hours & location\n- General physiotherapy questions\n\nHow can I assist you today?` },

  // Booking
  { match: ['book', 'appointment', 'schedule', 'reserve', 'slot'],
    reply: `📅 **Booking an Appointment**\n\nHere's how to book:\n1. **Login** to your account (or Sign Up if new)\n2. Go to the **Doctors** page\n3. Select your preferred therapist & time slot\n4. Confirm your booking\n\nYou can also call/WhatsApp us directly:\n📞 **${CLINIC.phone}**\n\nWould you like a **Free 15-Minute Consultation** first? Just let us know!` },

  // Free consultation
  { match: ['free consultation', 'free session', 'taster', '15 minute', '15-minute'],
    reply: `🎁 **Free Consultations Available!**\n\n✅ **Free 15-Minute Consultation** — Speak with a qualified physiotherapist about your condition at no cost.\n\n✅ **Care Home Free Taster Session** — A complimentary group session for care home managers to see our approach in action.\n\nVisit the **"Book Free Session"** page on our website, or call us:\n📞 **${CLINIC.phone}**` },

  // Hours
  { match: ['hour', 'open', 'time', 'when', 'schedule', 'timing', 'close', 'closed'],
    reply: `🕐 **Opening Hours**\n\n- **Mon – Fri:** 8:00 AM – 6:00 PM\n- **Saturday:** Closed\n- **Sunday:** Closed\n\nFor urgent queries outside hours, please email us:\n📧 **${CLINIC.email}**` },

  // Location / address
  { match: ['location', 'address', 'where', 'find', 'manchester', 'prestwich', 'windsor'],
    reply: `📍 **Our Address**\n\n${CLINIC.address}\n\nWe are a **mobile service** — meaning we come to **your home**, care facility, or community centre across Greater Manchester!\n\nNo need to travel to us. 🚗➡️🏠` },

  // Contact
  { match: ['contact', 'phone', 'call', 'email', 'reach', 'whatsapp', 'number', 'touch'],
    reply: `📞 **Contact EverActive Physiotherapy**\n\n- **Phone / WhatsApp:** ${CLINIC.phone}\n- **Email:** ${CLINIC.email}\n- **Address:** ${CLINIC.address}\n- **Hours:** Mon–Fri, 8 AM – 6 PM\n\nWe typically respond within a few hours during working hours. 😊` },

  // Care homes specific
  { match: ['care home', 'nursing home', 'residential', 'elderly', 'senior', 'dementia', 'mobility'],
    reply: `🏡 **Care Home Services**\n\nEverActive specialises in physiotherapy for care home residents:\n\n✅ Group mobility & exercise sessions\n✅ Fall prevention programmes\n✅ Stroke & neurological rehab support\n✅ Social, engaging & fun activities\n✅ Free Taster Session available for managers\n\nCall us to arrange a **free taster visit**:\n📞 **${CLINIC.phone}**` },

  // Sports / Athletes
  { match: ['sport', 'athlete', 'football', 'rugby', 'acl', 'knee', 'injury', 'pain', 'muscle', 'strain', 'sprain'],
    reply: `⚽ **Sports Physiotherapy & Rehab**\n\nWe offer elite-level sports physiotherapy:\n\n✅ Acute injury assessment & management\n✅ ACL, knee, shoulder & ankle rehabilitation\n✅ Return-to-play strength conditioning\n✅ Mobile sessions — we come to you\n\n> ⚠️ For a specific diagnosis or treatment plan, please **book an assessment** with our qualified physiotherapists.\n\n📞 **${CLINIC.phone}**` },

  // Services overview
  { match: ['service', 'offer', 'treatment', 'therapy', 'what do you do', 'help me', 'physio'],
    reply: `🏥 **Our Services**\n\n1. 🏠 **Mobile Home Physiotherapy** — We come to you\n2. 👥 **Care Home Group Sessions** — For residents & care facilities\n3. 🌿 **Community Group Classes** — Fall prevention & strength\n4. ⚽ **Sports Physio & Rehab** — For athletes\n5. 💪 **Mobile Personal Training** — Physio-led fitness\n\nAll services are delivered **at your location** across Greater Manchester.\n\nWant to know more about any specific service?` },

  // Pricing
  { match: ['price', 'cost', 'fee', 'charge', 'how much', 'paid', 'free', 'pay'],
    reply: `💷 **Pricing & Fees**\n\nWe offer a **free 15-minute initial consultation** — no obligation!\n\nFor specific pricing on our services, please contact us directly as fees vary based on treatment type and duration:\n\n📞 **${CLINIC.phone}**\n📧 **${CLINIC.email}**\n\nWe believe quality physio care should be accessible to everyone. 🙏` },

  // Reviews / Testimonials
  { match: ['review', 'rating', 'testimonial', 'feedback', 'experience'],
    reply: `⭐ **Patient Reviews**\n\nOur patients love us! You can read real testimonials on our **Patient Stories** page.\n\nTo leave your own review:\n1. Login to your account\n2. Visit the **Reviews** page\n3. Click "Share Your Experience"\n\nYour feedback helps us improve and helps others find the right care. 💙` },

  // Doctors / Therapists
  { match: ['doctor', 'therapist', 'physiotherapist', 'specialist', 'who', 'staff', 'team'],
    reply: `👨‍⚕️ **Our Team**\n\nEverActive has a team of qualified, registered physiotherapists specialising in:\n\n- Sports rehabilitation\n- Neurological conditions\n- Elderly care & mobility\n- Post-surgical recovery\n- Pain management\n\nView all our specialists on the **Doctors** page. You can book directly with your preferred therapist! 💙` },

  // Emergency
  { match: ['emergency', 'ambulance', 'chest pain', 'breathing', 'unconscious', 'severe', 'accident'],
    reply: `🚨 **Emergency Alert**\n\nIf this is a medical emergency, please call **999** (UK Emergency Services) immediately.\n\nFor urgent physiotherapy queries, call us:\n📞 **${CLINIC.phone}**\n\nDo NOT delay emergency care. Your safety is the priority. 🙏` },

  // Thank you
  { match: ['thank', 'thanks', 'cheers', 'appreciate', 'helpful', 'brilliant', 'great', 'amazing'],
    reply: `😊 You're very welcome! It's our pleasure to help.\n\nIf you have any other questions about EverActive Physiotherapy, feel free to ask.\n\n📞 **${CLINIC.phone}** | 📧 **${CLINIC.email}**\n\nHave a wonderful day! 💙` },

  // Goodbye
  { match: ['bye', 'goodbye', 'see you', 'take care', 'later'],
    reply: `👋 Goodbye! Take care and stay active.\n\nDon't hesitate to reach out anytime:\n📞 **${CLINIC.phone}**\n\n— The EverActive Team 💙` },
];

/**
 * Rule-based local AI fallback — zero API dependency
 * Returns null if no rule matches (Gemini will handle it)
 */
function getRuleBasedResponse(message) {
  const msg = message.toLowerCase().trim();

  for (const rule of RULES) {
    if (rule.match.some(kw => msg.includes(kw))) {
      return rule.reply;
    }
  }

  // Service-specific matches
  for (const svc of SERVICES) {
    if (svc.key.some(kw => msg.includes(kw))) {
      return `ℹ️ **${svc.name}**\n\n${svc.desc}\n\n📞 To book or learn more: **${CLINIC.phone}**\n📧 **${CLINIC.email}**`;
    }
  }

  return null; // Let Gemini handle it
}

/**
 * @desc    Handle chatbot queries — Gemini first, smart fallback second
 * @route   POST /api/ai/chat
 * @access  Public
 */
export const handleAIChat = async (req, res, next) => {
  try {
    const { history, message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide a chat message.' });
    }

    console.log('AI Chat Request:', { messageLength: message.length, hasHistory: !!history });

    let aiResponse = null;

    // 1️⃣ Try rule-based first for instant, reliable responses
    const ruleResponse = getRuleBasedResponse(message);
    if (ruleResponse) {
      console.log('Rule-based response matched');
    }

    // 2️⃣ Try Google AI API (check if key exists)
    const hasValidKey = process.env.GOOGLE_AI_API_KEY &&
                        process.env.GOOGLE_AI_API_KEY.trim().length > 0;

    console.log('Google AI API Check:', {
      hasKey: !!process.env.GOOGLE_AI_API_KEY,
      keyLength: process.env.GOOGLE_AI_API_KEY?.length || 0,
      hasValidKey
    });

    if (!ruleResponse && hasValidKey) {
      try {
        console.log('Attempting Google AI API call...');
        aiResponse = await getAIChatResponse(history, message);
        console.log('Google AI API succeeded');
      } catch (googleAIError) {
        console.error('Google AI API call failed:', googleAIError.message);
        // Google AI failed — fall through to generic fallback
      }
    }

    // 3️⃣ Final response priority: rule → deepseek → generic
    const finalResponse = ruleResponse || aiResponse ||
      `I'm here to help with EverActive Physiotherapy! Here's what I can assist with:\n\n` +
      `- 📅 Booking appointments\n- 🏥 Our services\n- 📞 Contact & hours\n- ⭐ Reviews\n\n` +
      `Or contact us directly:\n📞 **${CLINIC.phone}**\n📧 **${CLINIC.email}**`;

    res.status(200).json({ success: true, response: finalResponse });

  } catch (error) {
    console.error('AI Chat Handler Error:', error);
    next(error);
  }
};
