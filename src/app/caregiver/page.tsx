import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getViewer } from "@/lib/session";
import { profileCompleteness } from "@/lib/completeness";
import { CompletenessBar } from "@/components/CompletenessBar";
import { LogoutButton } from "@/components/BottomBar";
import { toggleHidden } from "@/app/actions/caregiver";

export default async function CaregiverDashboard() {
  const { session } = await getViewer();
  if (session?.userType !== "caregiver") redirect("/login?role=caregiver");

  const cg = await db.caregiver.findUnique({ where: { id: session.userId } });
  if (!cg) redirect("/login?role=caregiver");

  const percent = profileCompleteness(cg);

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-6 p-6">
      <h1 className="text-2xl font-bold">{cg.name ?? "Your profile"}</h1>

      <CompletenessBar percent={percent} />

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Edit your profile</h2>
        <Link href="/caregiver/onboarding/1" className="rounded-xl border px-4 py-3 text-base hover:bg-gray-50">
          Edit details
        </Link>
        <Link href="/caregiver/onboarding/2" className="rounded-xl border px-4 py-3 text-base hover:bg-gray-50">
          Add skills &amp; qualifications
        </Link>
        <Link href="/caregiver/onboarding/3" className="rounded-xl border px-4 py-3 text-base hover:bg-gray-50">
          Add experience
        </Link>
        <Link href="/caregiver/onboarding/4" className="rounded-xl border px-4 py-3 text-base hover:bg-gray-50">
          Set your rate
        </Link>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Visibility</h2>
        <form action={toggleHidden}>
          <button className="w-full rounded-xl border px-4 py-3 text-base hover:bg-gray-50">
            {cg.isHidden ? "Make profile visible" : "Hide my profile"}
          </button>
        </form>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Share</h2>
        <Link href="/caregiver/qr" className="rounded-xl border px-4 py-3 text-base hover:bg-gray-50">
          My QR code
        </Link>
        <Link href={`/c/${cg.id}`} className="rounded-xl border px-4 py-3 text-base hover:bg-gray-50">
          View my public profile
        </Link>
      </section>

      <div className="mt-auto">
        <LogoutButton />
      </div>
    </main>
  );
}
