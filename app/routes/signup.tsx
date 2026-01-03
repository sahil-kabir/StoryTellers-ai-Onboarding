import { useState } from "react";
import { Form, useNavigation } from "react-router";
import type { ActionFunctionArgs } from "react-router";
import { createAuth } from "~/auth";
import { redirect, useActionData } from "react-router";

export async function action({ request, context }: ActionFunctionArgs) {
  const auth = createAuth(context.cloudflare.env);

  const form = await request.formData();
  const email = form.get("email") as string;
  const password = form.get("password") as string;
  const name = form.get("name") as string;

  try {
    const res = await auth.api.signUpEmail({
      body: { name, email, password },
      asResponse: true,
    });

    if (res.status !== 200 && res.status !== 201) {
      let message = "Sign up failed";

      try {
        const body: any = await res.json();
        message = body?.error?.message ?? message;
      } catch {
      }

      return { error: { message } };
    }

    return redirect("/list", { headers: res.headers });
  } catch (err: any) {
    return {
      error: {
        message: err?.message ?? "Sign up failed",
      },
    };
  }
}


export default function SignUpForm() {
  const data = useActionData();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const navigate = useNavigation();

  return (
    <div style={{display:"flex", flexDirection:"column"}}>
    <h3>Enter User Information</h3>
    <Form method="post" style={{ display: "flex", flexDirection: "column" }}>
      <input style = {{marginTop:"5px"}} name="email" placeholder='Email Address' value={email} onChange={e => setEmail(e.target.value)} />
      <input style = {{marginTop:"5px"}} name="name" placeholder='Username' value={name} onChange={e => setName(e.target.value)} />
      <input style = {{marginTop:"5px"}} name="password" placeholder='Password' type='password' value={password} onChange={e => setPassword(e.target.value)} />
      <button style={{ marginTop: "5px" }} type="submit" disabled={loading}>
          {loading ? "Signing Up…" : "Sign Up"}
      </button>
    </Form>{data?.error && (
        <p style={{ color: "red", marginTop: "5px" }}>{data.error.message}</p>
      )}
    </div>
  )
}