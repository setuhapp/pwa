import { login } from "@/app/actions/auth";

export default async function Login({ searchParams }: { searchParams: Promise<{ role?: string; error?: string }> }) {
  const { role = "member", error } = await searchParams;
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-4 p-6">
      <h1 className="text-2xl font-bold">Log in as {role}</h1>
      {error && <p className="text-red-600">Wrong code. Use 000000.</p>}
      <form action={login} className="flex flex-col gap-3">
        <input type="hidden" name="role" value={role} />
        <input name="phone" inputMode="tel" placeholder="Phone number" required className="rounded-xl border px-4 py-4 text-lg" />
        <input name="code" placeholder="OTP (use 000000)" required className="rounded-xl border px-4 py-4 text-lg" />
        <button className="rounded-xl bg-blue px-4 py-4 text-lg font-semibold text-white">Continue</button>
      </form>
      <div className="text-sm text-gray-500 flex flex-col gap-1 mt-1">
        <p>Dev mode: any phone number, OTP is 000000.</p>
        {role === "member" && (
          <p className="text-blue font-bold">
            💡 Subscribed member test account (unlocked profiles): 9200000000
          </p>
        )}
      </div>
    </main>
  );
}
