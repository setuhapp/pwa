import { getViewer } from "@/lib/session";
import { subscribeMember, cancelSubscriptionRequestAction } from "@/app/actions/member";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { cookies } from "next/headers";

export default async function SubscribePage() {
  const { session, tier } = await getViewer();

  if (!session || session.userType !== "member") redirect("/login?role=member");
  if (tier === "member") redirect("/browse");

  const member = await db.member.findUnique({
    where: { id: session.userId },
  });
  if (!member) redirect("/login?role=member");

  const lang = (await cookies()).get("lang")?.value || "en";
  const isPending = member.subscriptionStatus === "pending";

  return (
    <main className="mx-auto flex max-w-md w-full flex-col items-center justify-center p-6 text-center pb-24">
      {isPending ? (
        <>
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-amber-50 text-amber-500 ring-8 ring-amber-50/50 animate-pulse">
            <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">
            {lang === "ta" ? "சரிபார்ப்பு நிலுவையில் உள்ளது" : "Payment Request Pending"}
          </h1>
          <p className="mt-3 text-sm font-medium text-gray-500 leading-relaxed px-2">
            {lang === "ta" 
              ? "உங்கள் பிரீமியம் சந்தா கோரிக்கை அனுப்பப்பட்டது. எங்கள் நிர்வாகி உங்கள் பணம் செலுத்துதலை சரிபார்த்தவுடன் கணக்கு செயல்படுத்தப்படும்." 
              : "Your payment request is sent. Once our administrator verifies your UPI transaction, your premium account will be activated automatically."}
          </p>

          {/* QR Code Card */}
          <div className="mt-6 w-full rounded-3xl border border-gray-100 bg-white p-5 shadow-xl">
            <img 
              src="/payment_qr.png" 
              alt="Scan & Pay" 
              className="w-full max-h-[260px] object-contain rounded-xl select-none" 
            />
            <div className="mt-4 text-xs font-bold uppercase tracking-wider text-slate-500">
              UPI ID: <span className="text-blue font-extrabold select-all">setuh.business@ybl</span>
            </div>
            <div className="mt-1 text-[11px] font-semibold text-slate-400">
              Plan: ₹999 / {lang === "ta" ? "மாதம்" : "month"}
            </div>
          </div>

          <div className="flex flex-col gap-3 w-full mt-6">
            <Link 
              href="/member/subscribe"
              className="flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-[#dca334] to-[#c29d53] px-4 py-4 text-sm font-extrabold text-white shadow-lg shadow-amber-600/30 transition-transform active:scale-[0.98] hover:brightness-105"
            >
              🔄 {lang === "ta" ? "நிலையை புதுப்பிக்கவும்" : "Refresh Activation Status"}
            </Link>

            <form action={cancelSubscriptionRequestAction} className="w-full">
              <button 
                type="submit"
                className="flex w-full items-center justify-center rounded-2xl border border-gray-200 bg-white px-4 py-4 text-sm font-bold text-gray-600 transition-transform active:scale-[0.98] hover:bg-gray-50"
              >
                {lang === "ta" ? "கோரிக்கையை ரத்துசெய்" : "Cancel Request"}
              </button>
            </form>
          </div>
        </>
      ) : (
        <>
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 text-blue ring-8 ring-blue-50/50">
            <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">
            {lang === "ta" ? "முழு அணுகலைத் திறக்கவும்" : "Unlock Premium Access"}
          </h1>
          <p className="mt-3 text-sm font-medium text-gray-500 leading-relaxed px-2">
            {lang === "ta" 
              ? "முழு விவரங்களைப் பார்க்கவும், வாட்ஸ்அப்பில் தொடர்பு கொள்ளவும் மற்றும் சிறந்த பராமரிப்பாளர்களைக் கண்டறியவும் பிரீமியம் சந்தாவுக்கு மாறவும்."
              : "Upgrade to premium membership to view caregiver details, contact them on WhatsApp, and find the perfect match for your family."}
          </p>

          {/* Pricing & QR card */}
          <div className="mt-6 w-full rounded-3xl border border-gray-100 bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
              <span className="text-sm font-bold text-gray-900">{lang === "ta" ? "மாதாந்திர திட்டம்" : "Monthly Plan"}</span>
              <span className="text-lg font-extrabold text-blue">₹999<span className="text-sm font-medium text-gray-400">/{lang === "ta" ? "மாதம்" : "mo"}</span></span>
            </div>

            <img 
              src="/payment_qr.png" 
              alt="Scan & Pay" 
              className="w-full max-h-[240px] object-contain rounded-xl select-none" 
            />

            <div className="mt-4 text-xs font-semibold text-gray-500 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              {lang === "ta" 
                ? "மேலே உள்ள QR குறியீட்டை ஸ்கேன் செய்து ₹999 ஐ UPI மூலம் செலுத்தவும், பின்னர் செயல்படுத்தக் கோர கீழே உள்ள 'கட்டணம் அனுப்பி குழுசேர்' பொத்தானைக் கிளிக் செய்யவும்." 
                : "Scan the QR code above to pay ₹999 via UPI, then click 'Send Payment & Subscribe' to request activation from our admin."}
            </div>
            
            <form action={subscribeMember} className="mt-5">
              <button 
                type="submit" 
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#dca334] to-[#c29d53] px-4 py-4 text-base font-extrabold text-white shadow-lg shadow-amber-600/30 transition-transform active:scale-[0.98] hover:brightness-105 cursor-pointer"
              >
                {lang === "ta" ? "கட்டணம் அனுப்பி குழுசேர்" : "Send Payment & Subscribe"}
              </button>
            </form>
          </div>

          <Link href="/browse" className="mt-6 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors">
            {lang === "ta" ? "ரத்து செய்து பின்செல்லவும்" : "Cancel and go back"}
          </Link>
        </>
      )}
    </main>
  );
}
