import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createDb } from "../db";
import * as schema from "../auth-schema";

export function createAuth(env: Env) {
  if (!env.BETTER_AUTH_SECRET) {
    throw new Error("BETTER_AUTH_SECRET is not set");
  }

  const db = createDb(env);

  return betterAuth({
    basePath: "/api/auth",
    secret: env.BETTER_AUTH_SECRET,
    database: drizzleAdapter(db, { provider: "pg" , schema}),

    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },
  });
}