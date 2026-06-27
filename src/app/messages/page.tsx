import { getViewer } from "@/lib/session";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function InboxPage() {
  const { session } = await getViewer();
  if (!session) redirect("/login");

  const isMember = session.userType === "member";

  // Get all messages for the current user
  const messages = await db.message.findMany({
    where: isMember ? { memberId: session.userId } : { caregiverId: session.userId },
    orderBy: { createdAt: "desc" },
    include: {
      caregiver: true,
      member: true,
    }
  });

  // Group by the other person to create conversational threads
  const threads = new Map<string, any>();
  for (const msg of messages) {
    const otherId = isMember ? msg.caregiverId : msg.memberId;
    if (!threads.has(otherId)) {
      threads.set(otherId, {
        otherId,
        name: isMember ? msg.caregiver.name : msg.member.name,
        photoUrl: isMember ? msg.caregiver.photoUrl : null,
        lastMessage: msg.content,
        lastMessageAt: msg.createdAt,
      });
    }
  }

  const threadList = Array.from(threads.values());

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col p-6">
      <h1 className="mb-6 text-3xl font-extrabold tracking-tight text-gray-900">Messages</h1>
      
      {threadList.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-gray-50/50 p-10 text-center">
          <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-400">
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
          </div>
          <p className="text-sm font-medium text-gray-500">No messages yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {threadList.map((thread) => (
            <Link 
              href={`/messages/${thread.otherId}`} 
              key={thread.otherId}
              className="flex items-center gap-4 rounded-3xl border border-gray-100 bg-white p-4 shadow-[0_4px_20px_rgb(0,0,0,0.03)] transition-transform active:scale-[0.98]"
            >
              <div className="h-14 w-14 overflow-hidden rounded-full bg-gray-100 ring-2 ring-brand-50">
                {thread.photoUrl ? (
                  <img src={thread.photoUrl} alt={thread.name || "User"} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xl text-gray-400">👤</div>
                )}
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="flex items-center justify-between">
                  <h3 className="truncate text-base font-bold text-gray-900">{thread.name || "Unknown"}</h3>
                  <span className="text-xs font-medium text-gray-400">
                    {thread.lastMessageAt.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <p className="truncate text-sm text-gray-500 mt-0.5">{thread.lastMessage}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
