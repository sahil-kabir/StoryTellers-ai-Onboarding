import type { Route } from "./+types/home";
import { useState } from "react";
import { useNavigate } from "react-router";
import { createAuth } from "~/auth";
import type {ActionFunctionArgs} from "react-router"
import {redirect, useActionData, Form } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export async function action({ request, context }: ActionFunctionArgs) {
  const auth = createAuth(context.cloudflare.env);

  const form = await request.formData();
  const email = form.get("email") as string;
  const password = form.get("password") as string;

  try {
    const res = await auth.api.signInEmail({
      body: { email, password },
      asResponse: true,
    });

    if (res.status !== 200 && res.status !== 201) {
      let message = "Invalid email or password";

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
        message: err?.message ?? "Invalid email or password",
      },
    };
  }
}


function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const data = useActionData()


  return (
    <>
    <Form method="post" style={{display:"flex", flexDirection:"column"}}>
      <input style = {{marginTop:"5px"}} name = "email" placeholder='Email address' value={email} onChange={e => setEmail(e.target.value)} />
      <input style = {{marginTop:"5px"}} name = "password" type="password" placeholder='Password' value={password} onChange={e => setPassword(e.target.value)} />
      <button style = {{marginTop:"5px"}} type = 'submit'>Log In</button>
    </Form>
      {data?.error && (
        <p style={{ color: "red", marginTop: "5px" }}>{data.error.message}</p>
      )}
      <button style = {{marginTop:"10px"}} onClick={() => navigate("/signup")}>Sign Up</button>
    </>
  );
}

export default function Home() {
  return <LoginForm/>;
}
