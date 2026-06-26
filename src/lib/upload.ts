import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { put } from "@vercel/blob";

// Stores uploads under public/uploads or Vercel Blob.
export async function saveUpload(file: File): Promise<string> {
  const name = `${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
  
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { url } = await put(name, file, { access: 'public' });
    return url;
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), bytes);
  return `/uploads/${name}`;
}
