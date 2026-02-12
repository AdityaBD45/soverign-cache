import bcrypt from "bcryptjs";
import { connectDB } from "@/app/lib/db";
import { ApiKey } from "@/models/ApiKey";
import { Namespace } from "@/models/Namespace";

export async function requireApiKey(req: Request) {
  const auth = req.headers.get("authorization");

  if (!auth || !auth.startsWith("Bearer ")) {
    throw new Error("Missing Authorization header (Bearer token required)");
  }

  const rawKey = auth.replace("Bearer ", "").trim();

  const pepper = process.env.API_KEY_PEPPER;
  if (!pepper) throw new Error("API_KEY_PEPPER missing in env");

  await connectDB();

  const prefix = rawKey.slice(0, 12);

  const candidates = await ApiKey.find({
    keyPrefix: prefix,
    isActive: true,
  });

  if (!candidates.length) throw new Error("Invalid API key");

  for (const keyDoc of candidates) {
    const ok = await bcrypt.compare(rawKey + pepper, keyDoc.keyHash);

    if (ok) {
      const namespace = await Namespace.findById(keyDoc.namespaceId);
      if (!namespace) throw new Error("Namespace not found");

      return { apiKey: keyDoc, namespace };
    }
  }

  throw new Error("Invalid API key");
}
