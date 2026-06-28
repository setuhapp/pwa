import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getViewer } from "@/lib/session";
import { CITIES, SKILL_TAGS, SPECIALISATIONS, AVAILABILITY } from "@/lib/constants";
import { saveStep1, saveStep2, saveStep3, saveStep4 } from "@/app/actions/caregiver";
import { parseStringArray } from "@/lib/json";
import { cookies } from "next/headers";

export default async function OnboardingStep({
  params,
}: {
  params: Promise<{ step: string }>;
}) {
  const { step } = await params;
  const { session } = await getViewer();
  if (session?.userType !== "caregiver") redirect("/login?role=caregiver");

  const cg = await db.caregiver.findUnique({ where: { id: session.userId } });
  if (!cg) redirect("/login?role=caregiver");

  if (!["1", "2", "3", "4"].includes(step)) redirect("/caregiver");

  const stepNum = Number(step);
  const inputClass = "w-full rounded-xl border px-4 py-4 text-base focus:outline-none focus:ring-2 focus:ring-blue-500";
  const labelClass = "flex flex-col gap-1 text-sm font-medium text-gray-700";
  const lang = (await cookies()).get("lang")?.value || "en";

  return (
    <main className="mx-auto flex max-w-md w-full flex-col gap-6 p-6 pb-12">
      <div className="flex items-center justify-between">
        <Link href="/caregiver" className="text-sm text-blue underline">
          ← Back
        </Link>
        <span className="text-sm text-gray-500">Step {stepNum} of 4</span>
      </div>

      {/* Onboarding Wizard Tabs */}
      <div className="flex border-b border-line pb-2 mb-2 justify-between gap-1 select-none">
        {["1", "2", "3", "4"].map((s) => (
          <Link
            key={s}
            href={`/caregiver/onboarding/${s}`}
            className={`pb-1 px-2.5 text-sm font-bold border-b-2 transition-all duration-200 ${
              step === s 
                ? "border-blue text-blue font-extrabold" 
                : "border-transparent text-ink-3 hover:text-ink-2"
            }`}
          >
            {lang === "ta" ? `படி ${s}` : `Step ${s}`}
          </Link>
        ))}
      </div>

      {step === "1" && (
        <>
          <h1 className="text-2xl font-bold">Your details</h1>
          <form action={saveStep1} encType="multipart/form-data" className="flex flex-col gap-4">
            <label className={labelClass}>
              Photo
              <input type="file" name="photo" accept="image/*" className="w-full rounded-xl border px-4 py-3 text-base" />
            </label>
            <label className={labelClass}>
              Full name
              <input
                name="name"
                defaultValue={cg.name ?? ""}
                placeholder="Your full name"
                required
                className={inputClass}
              />
            </label>
            <label className={labelClass}>
              Address
              <input
                name="address"
                defaultValue={cg.address ?? ""}
                placeholder="Your address"
                className={inputClass}
              />
            </label>
            <label className={labelClass}>
              City
              <select name="city" defaultValue={cg.city ?? ""} className={inputClass}>
                <option value="">Select city</option>
                {CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <button className="mt-2 rounded-xl bg-blue px-4 py-4 text-lg font-semibold text-white">
              Save
            </button>
          </form>
        </>
      )}

      {step === "2" && (
        <>
          <h1 className="text-2xl font-bold">Skills &amp; qualifications</h1>
          <form action={saveStep2} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-gray-700">Skills</span>
              {SKILL_TAGS.map((tag) => {
                const checked = parseStringArray(cg.skills).includes(tag);
                return (
                  <label key={tag} className="flex items-center gap-3 rounded-xl border px-4 py-3 text-base">
                    <input
                      type="checkbox"
                      name="skills"
                      value={tag}
                      defaultChecked={checked}
                      className="h-5 w-5"
                    />
                    {tag}
                  </label>
                );
              })}
            </div>
            <label className={labelClass}>
              Qualifications
              <input
                name="qualifications"
                defaultValue={cg.qualifications ?? ""}
                placeholder="e.g. GNM, ANM, B.Sc Nursing"
                className={inputClass}
              />
            </label>
            <button className="mt-2 rounded-xl bg-blue px-4 py-4 text-lg font-semibold text-white">
              Save
            </button>
          </form>
        </>
      )}

      {step === "3" && (
        <>
          <h1 className="text-2xl font-bold">Experience</h1>
          <form action={saveStep3} className="flex flex-col gap-4">
            <label className={labelClass}>
              Years of experience
              <input
                type="number"
                name="experienceYears"
                min={0}
                defaultValue={cg.experienceYears ?? ""}
                placeholder="e.g. 5"
                className={inputClass}
              />
            </label>
            <label className={labelClass}>
              Prior families cared for
              <input
                name="priorFamilies"
                defaultValue={cg.priorFamilies ?? ""}
                placeholder="e.g. 3 families over 4 years"
                className={inputClass}
              />
            </label>
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-gray-700">Specialisations</span>
              {SPECIALISATIONS.map((spec) => {
                const checked = parseStringArray(cg.specialisations).includes(spec);
                return (
                  <label key={spec} className="flex items-center gap-3 rounded-xl border px-4 py-3 text-base">
                    <input
                      type="checkbox"
                      name="specialisations"
                      value={spec}
                      defaultChecked={checked}
                      className="h-5 w-5"
                    />
                    {spec}
                  </label>
                );
              })}
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-gray-700">Availability</span>
              {AVAILABILITY.map((avail) => (
                <label key={avail} className="flex items-center gap-3 rounded-xl border px-4 py-3 text-base">
                  <input
                    type="radio"
                    name="availability"
                    value={avail}
                    defaultChecked={cg.availability === avail}
                    className="h-5 w-5"
                  />
                  {avail}
                </label>
              ))}
            </div>
            <button className="mt-2 rounded-xl bg-blue px-4 py-4 text-lg font-semibold text-white">
              Save
            </button>
          </form>
        </>
      )}

      {step === "4" && (
        <>
          <h1 className="text-2xl font-bold">Your rate</h1>
          <form action={saveStep4} className="flex flex-col gap-4">
            <label className={labelClass}>
              Daily rate (₹)
              <input
                type="number"
                name="dailyRate"
                min={0}
                defaultValue={cg.dailyRate ?? ""}
                placeholder="e.g. 800"
                className={inputClass}
              />
            </label>
            <label className={labelClass}>
              Monthly rate (₹)
              <input
                type="number"
                name="monthlyRate"
                min={0}
                defaultValue={cg.monthlyRate ?? ""}
                placeholder="e.g. 18000"
                className={inputClass}
              />
            </label>
            <button className="mt-2 rounded-xl bg-blue px-4 py-4 text-lg font-semibold text-white">
              Save
            </button>
          </form>
        </>
      )}
    </main>
  );
}
