import { getViewer } from "@/lib/session";
import { cookies } from "next/headers";
import { getTranslations } from "@/lib/translations";
import { HomePageClient } from "./HomePage";

export default async function Home() {
  const { session, tier } = await getViewer();
  const lang = (await cookies()).get("lang")?.value || "en";
  const t = getTranslations(lang);

  return <HomePageClient session={session} tier={tier} t={t} />;
}
