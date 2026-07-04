import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="mx-auto min-h-screen max-w-md bg-gradient-to-b from-blue via-blue to-blue-dark p-6 text-white pb-24">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md ring-1 ring-white/20 transition-all hover:bg-white/20 active:scale-[0.95]">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-xl font-bold">Terms & Conditions</h1>
      </div>

      <div className="flex flex-col gap-5 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md text-blue-100 text-sm leading-relaxed max-h-[75vh] overflow-y-auto">
        <p className="text-xs text-blue-200/60 font-semibold uppercase tracking-wider">Last Updated: July 4, 2026</p>

        <h2 className="text-base font-extrabold text-white mt-2">1. Scope of Services & Intermediary Role</h2>
        <p>
          Setuh is a matchmaking marketplace platform only. We do not employ Caregivers, nor are we a home care agency, healthcare provider, or registry. We serve solely as an intermediary matching platform to help Members discover, communicate, and book Caregivers. All engagements are directly between those two parties.
        </p>

        <h2 className="text-base font-extrabold text-white mt-2">2. Background Verifications & Disclaimer</h2>
        <p>
          While Setuh performs certain verification checks in good faith (such as Aadhaar eKYC checks and caregiver reference verifications), Setuh does not warrant, guarantee, or represent the continuous safety, suitability, skills, character, or medical competence of any Caregiver. The final due diligence rests entirely on the Member.
        </p>

        <h2 className="text-base font-extrabold text-white mt-2">3. No Medical Advice</h2>
        <p>
          Caregivers listed on the Platform are domestic attenders, companions, or home care aides. They are not licensed medical professionals (such as doctors or registered nurses) unless explicitly stated. Any information displayed on the Platform does not constitute medical advice, diagnosis, or treatment.
        </p>

        <h2 className="text-base font-extrabold text-white mt-2">4. Member Subscriptions & Payments</h2>
        <p>
          Members pay a subscription fee to unlock unrestricted access to verified Caregiver contact details. Subscriptions are billed on a recurring monthly basis via Razorpay. Subscriptions are non-refundable. Members and Caregivers agree not to bypass the Platform's matchmaking tracking or engage in private off-platform transactions to avoid subscription fees.
        </p>

        <h2 className="text-base font-extrabold text-white mt-2">5. Caregiver Conduct & Platform Policies</h2>
        <p>
          Caregivers agree to provide accurate qualifications, references, experience, rates, and availability. Falsifying identification or credentials will result in immediate termination of the Caregiver's account. Abuse, negligence, theft, or absenteeism will result in immediate blacklisting from the Platform.
        </p>

        <h2 className="text-base font-extrabold text-white mt-2">6. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by law, Setuh and its directors, employees, or partners shall not be liable for any direct, indirect, incidental, special, or consequential damages resulting from the use or inability to use the Platform, including but not limited to personal injury, property damage, theft, loss of life, or misconduct arising from the placement or actions of a Caregiver.
        </p>

        <h2 className="text-base font-extrabold text-white mt-2">7. Governing Law & Jurisdiction</h2>
        <p>
          These Terms are governed by and construed in accordance with the laws of India. Any disputes arising under or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts located in Chennai, Tamil Nadu, India.
        </p>
      </div>
    </main>
  );
}
