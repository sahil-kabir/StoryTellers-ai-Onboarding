import type { ActionFunctionArgs } from "react-router";
import { createAuth } from "~/auth";

export async function action({ request, context }: ActionFunctionArgs) {
  const auth = createAuth(context.cloudflare.env);
  return auth.handler(request);
}