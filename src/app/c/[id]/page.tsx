import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getViewer } from "@/lib/session";
import { toPublicCaregiver, toFullCaregiver } from "@/lib/serializers";
import { CaregiverProfilePreview } from "@/components/CaregiverProfilePreview";
import { cookies } from "next/headers";

export default async function PublicProfile({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const rawCg = await db.caregiver.findUnique({
    where: { id },
    include: { verifications: true },
  });

  if (!rawCg) notFound();

  if (rawCg.isHidden) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 p-6">
        <p className="text-center text-gray-600">This profile is currently unavailable.</p>
      </main>
    );
  }

  const { tier, session } = await getViewer();
  const canSeeDetails =
    tier === "member" ||
    tier === "admin" ||
    (session?.userType === "caregiver" && session.userId === rawCg.id);

  const cg = canSeeDetails ? toFullCaregiver(rawCg) : toPublicCaregiver(rawCg);
  const isVerified = rawCg.verifications.length > 0;
  const verifiedAt = rawCg.verifications[0]?.createdAt ?? null;
  const lang = (await cookies()).get("lang")?.value || "en";

  let isBookmarked = false;
  if (session?.userType === "member") {
    const bookmarkCount = await db.bookmark.count({
      where: {
        memberId: session.userId,
        caregiverId: id,
      },
    });
    isBookmarked = bookmarkCount > 0;
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-6 p-6">
      <CaregiverProfilePreview
        caregiver={cg}
        canSeeDetails={canSeeDetails}
        isOwnProfile={session?.userType === "caregiver" && session.userId === rawCg.id}
        isLoggedIn={!!session}
        isVerified={isVerified}
        verifiedAt={verifiedAt}
        isBookmarked={isBookmarked}
        lang={lang}
      />
    </main>
  );
}
