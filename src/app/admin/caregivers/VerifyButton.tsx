"use client";
import { verifyCaregiver } from "@/app/actions/admin";
import { useState } from "react";

export function VerifyButton({ caregiverId, isVerified }: { caregiverId: string, isVerified: boolean }) {
  const [loading, setLoading] = useState(false);

  if (isVerified) {
    return <span className="text-gray-400 text-sm">Verified</span>;
  }

  return (
    <button
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        await verifyCaregiver(caregiverId);
        setLoading(false);
      }}
      className="text-brand-600 hover:text-brand-900 disabled:opacity-50"
    >
      {loading ? "Verifying..." : "Verify Profile"}
    </button>
  );
}
