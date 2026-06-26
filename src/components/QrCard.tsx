"use client";
import { QRCodeCanvas } from "qrcode.react";

export function QrCard({ url }: { url: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border p-4">
      <QRCodeCanvas value={url} size={200} />
      <p className="break-all text-center text-sm text-gray-500">{url}</p>
    </div>
  );
}
