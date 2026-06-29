import { DEV_OTP } from "@/lib/constants";

// Twilio Verify integration. When the Twilio env vars are absent (local/dev),
// we fall back to accepting DEV_OTP so the whole flow stays testable for free.

const SID = process.env.TWILIO_ACCOUNT_SID;
const TOKEN = process.env.TWILIO_AUTH_TOKEN;
const VERIFY_SID = process.env.TWILIO_VERIFY_SERVICE_SID;

export function isOtpLive(): boolean {
  return Boolean(SID && TOKEN && VERIFY_SID);
}

// Normalise to E.164. Defaults to India (+91) for bare 10-digit numbers.
export function toE164(phone: string): string {
  const trimmed = phone.trim();
  if (trimmed.startsWith("+")) return "+" + trimmed.slice(1).replace(/\D/g, "");
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length === 10) return "+91" + digits;
  if (digits.length === 12 && digits.startsWith("91")) return "+" + digits;
  return "+" + digits;
}

function authHeader(): string {
  return "Basic " + Buffer.from(`${SID}:${TOKEN}`).toString("base64");
}

async function twilioPost(path: string, body: Record<string, string>): Promise<Response> {
  return fetch(`https://verify.twilio.com/v2/Services/${VERIFY_SID}/${path}`, {
    method: "POST",
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(body).toString(),
  });
}

// Sends an OTP. In dev mode this is a no-op that logs the code to the server console.
export async function sendOtp(phone: string): Promise<{ ok: boolean; error?: string }> {
  const to = toE164(phone);
  if (!isOtpLive()) {
    console.log(`[otp] dev mode — use code ${DEV_OTP} for ${to}`);
    return { ok: true };
  }
  const res = await twilioPost("Verifications", { To: to, Channel: "sms" });
  if (!res.ok) {
    console.error("[otp] Twilio send failed", res.status, await res.text().catch(() => ""));
    return { ok: false, error: "send_failed" };
  }
  return { ok: true };
}

// Verifies a submitted code. In dev mode, only DEV_OTP is accepted.
export async function checkOtp(phone: string, code: string): Promise<boolean> {
  if (!isOtpLive()) return code === DEV_OTP;
  const res = await twilioPost("VerificationCheck", { To: toE164(phone), Code: code });
  if (!res.ok) return false;
  const data = (await res.json().catch(() => null)) as { status?: string } | null;
  return data?.status === "approved";
}
