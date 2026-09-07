import { createHash, randomBytes } from "crypto";

export function hashKey(key: string) {
  return createHash("sha256").update(key).digest("hex");
}

export function generateApiKey(type: "publishable" | "secret") {
  const prefix = type === "publishable" ? "pk_test_" : "sk_test_";
  const key = `${prefix}${randomBytes(12).toString("hex")}`;
  return { key, prefix: key.slice(0, 16), hash: hashKey(key) };
}
