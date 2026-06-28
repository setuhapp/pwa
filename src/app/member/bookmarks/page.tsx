import { db } from "@/lib/db";
import { getViewer } from "@/lib/session";
import { toPublicCaregiver, toFullCaregiver } from "@/lib/serializers";
import { ProfileCard } from "@/components/ProfileCard";
import { cookies } from "next/headers";
import { getTranslations } from "@/lib/translations";
import { redirect } from "next/navigation";

export default async function BookmarksPage() {
  const { session, tier } = await getViewer();
  
  if (session?.userType !== "member") {
    redirect("/login?role=member");
  }

  const lang = (await cookies()).get("lang")?.value || "en";
  const t = getTranslations(lang);

  const bookmarks = await db.bookmark.findMany({
    where: { memberId: session.userId },
    include: {
      caregiver: true,
    },
  });

  const serialized = bookmarks.map((b) => {
    return tier === "member" ? toFullCaregiver(b.caregiver) : toPublicCaregiver(b.caregiver);
  });

  return (
    <main className="relative mx-auto flex max-w-md w-full flex-col bg-slate-50 pb-24">
      {/* Dark Blue Hero Background */}
      <div className="absolute inset-x-0 top-0 h-[220px] bg-gradient-to-b from-blue via-blue/90 to-slate-50 rounded-b-[3rem] shadow-sm" />

      <div className="relative z-10 flex flex-col gap-6 p-6 pt-12">
        <div className="mb-2 text-center text-white drop-shadow-md">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {lang === "ta" ? "சேமிக்கப்பட்டவை" : "Saved Caregivers"}
          </h1>
          <p className="mt-2 text-sm font-medium text-slate-300">
            {lang === "ta" ? "உங்கள் சேமிக்கப்பட்ட பராமரிப்பாளர்கள் பட்டியல்" : "Your bookmarked caregivers for quick access"}
          </p>
        </div>

        {serialized.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 rounded-[2rem] border border-white/40 bg-white/80 shadow-xl backdrop-blur-xl ring-1 ring-black/5 mt-4 text-center">
            <span className="text-4xl mb-3">🔖</span>
            <h2 className="text-lg font-bold text-slate-800">
              {lang === "ta" ? "சேமித்தவை எதுவும் இல்லை" : "No saved caregivers"}
            </h2>
            <p className="text-sm text-slate-500 mt-2 max-w-[240px] font-medium leading-relaxed">
              {lang === "ta" 
                ? "பராமரிப்பாளரின் சுயவிவரத்தில் உள்ள புக்மார்க் பொத்தானைக் கிளிக் செய்வதன் மூலம் அவர்களைச் சேமிக்கலாம்." 
                : "Tap the bookmark icon on a caregiver's profile to save them here for quick lookup."}
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {serialized.map((cg) => (
              <ProfileCard key={cg.id} caregiver={cg} lang={lang} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
