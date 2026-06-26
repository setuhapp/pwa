import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getViewer } from "@/lib/session";
import { QrCard } from "@/components/QrCard";

export default async function CaregiverQr() {
  const { session } = await getViewer();
  if (session?.userType !== "caregiver") redirect("/login?role=caregiver");

  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  const url = `${proto}://${host}/c/${session.userId}`;

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-6 p-6">
      <div>
        <Link href="/caregiver" className="text-sm text-blue-600 underline">
          ← Back
        </Link>
      </div>
      <h1 className="text-2xl font-bold">Share your profile</h1>
      <p className="text-sm text-gray-600">
        Show this QR code or share the link so families can find you.
      </p>
      <QrCard url={url} />
    </main>
  );
}
