import { getViewer } from "@/lib/session";
import { db } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import { ChatInput } from "@/components/ChatInput";

export default async function ChatPage({ params }: { params: Promise<{ otherUserId: string }> }) {
  const { otherUserId } = await params;
  const { session, tier } = await getViewer();
  if (!session) redirect("/login");

  // Ensure they are subscribed to message
  if (session.userType === "member" && tier !== "member") {
    redirect("/member/subscribe");
  }

  const isMember = session.userType === "member";

  // Verify the other user exists and get their name
  let otherName = "Unknown";
  if (isMember) {
    const cg = await db.caregiver.findUnique({ where: { id: otherUserId } });
    if (!cg) notFound();
    otherName = cg.name || "Caregiver";
  } else {
    const mem = await db.member.findUnique({ where: { id: otherUserId } });
    if (!mem) notFound();
    otherName = mem.name || "Family Member";
  }

  // Fetch messages
  const messages = await db.message.findMany({
    where: {
      memberId: isMember ? session.userId : otherUserId,
      caregiverId: isMember ? otherUserId : session.userId,
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <main className="mx-auto flex h-[calc(100vh-4rem-5rem)] max-w-md flex-col">
      {/* Header */}
      <div className="flex h-16 shrink-0 items-center border-b border-gray-100 bg-white/80 px-4 backdrop-blur-md">
        <h2 className="text-lg font-bold text-gray-900">{otherName}</h2>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-400">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            </div>
            <p className="text-sm font-medium text-gray-500">Say hello to {otherName}!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender === session.userType;
            return (
              <div key={msg.id} className={`flex w-full ${isMe ? "justify-end" : "justify-start"}`}>
                <div 
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                    isMe 
                      ? "rounded-tr-sm bg-brand-500 text-white shadow-sm" 
                      : "rounded-tl-sm bg-white border border-gray-100 text-gray-800 shadow-[0_2px_10px_rgb(0,0,0,0.02)]"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input Area */}
      <ChatInput otherUserId={otherUserId} />
    </main>
  );
}
