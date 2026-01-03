import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

export function createDb(env: Env) {
  if (!env.AUTH_DATABASE_URL) {
    throw new Error("AUTH_DATABASE_URL is not set (db.ts method throwing this)");
  }

  const sql = neon(env.AUTH_DATABASE_URL);
  return drizzle({ client: sql });
}