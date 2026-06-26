import Link from "next/link";

export function SubscribePrompt() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-brand-100 bg-gradient-to-br from-brand-50 to-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-600">
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
      </div>
      <h3 className="mb-2 text-lg font-bold text-gray-900">Unlock Full Access</h3>
      <p className="mb-5 text-sm leading-relaxed text-gray-600">
        You&apos;ve reached the free limit of 5 profiles. Subscribe to see everyone and get full contact details.
      </p>
      <Link href="/login?role=member" className="inline-flex w-full items-center justify-center rounded-2xl bg-orange-600 px-4 py-3.5 text-sm font-semibold text-white shadow-md transition-transform active:scale-[0.98] hover:bg-orange-700">
        Subscribe now
      </Link>
    </div>
  );
}
