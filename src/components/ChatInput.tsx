"use client";

import { useState } from "react";
import { sendMessage } from "@/app/actions/messages";

export function ChatInput({ otherUserId }: { otherUserId: string }) {
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSending) return;

    setIsSending(true);
    try {
      await sendMessage(otherUserId, content.trim());
      setContent("");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="shrink-0 border-t border-gray-100 bg-white p-3">
      <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 pr-2 transition-colors focus-within:border-brand-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-brand-500/10">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-transparent px-4 py-3 text-sm text-gray-900 outline-none placeholder:text-gray-400"
          disabled={isSending}
        />
        <button
          type="submit"
          disabled={!content.trim() || isSending}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white transition-transform active:scale-90 disabled:opacity-50"
        >
          <svg className="h-4 w-4 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
        </button>
      </div>
    </form>
  );
}
