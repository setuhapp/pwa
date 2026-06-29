// Builds a wa.me click-to-chat deep link. Conversations happen natively in WhatsApp.

const PREFILL = "Hi, I found you on SETUH and would like to ask about elder care.";

// Normalise to digits with country code, no "+" (wa.me format). Defaults to India.
function toWaNumber(phone: string): string {
  const trimmed = phone.trim();
  const digits = trimmed.replace(/\D/g, "");
  if (trimmed.startsWith("+")) return digits;
  if (digits.length === 10) return "91" + digits;
  return digits;
}

export function whatsappLink(phone: string, text: string = PREFILL): string {
  return `https://wa.me/${toWaNumber(phone)}?text=${encodeURIComponent(text)}`;
}
