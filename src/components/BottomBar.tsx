import { logout } from "@/app/actions/auth";

export function LogoutButton() {
  return (
    <form action={logout}>
      <button className="text-sm text-gray-500 underline">Log out</button>
    </form>
  );
}
