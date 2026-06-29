import { isOtpLive } from "@/lib/otp";
import { LoginForm } from "./LoginForm";

export default async function Login({ searchParams }: { searchParams: Promise<{ role?: string }> }) {
  const { role = "member" } = await searchParams;
  return <LoginForm role={role} isDev={!isOtpLive()} />;
}
