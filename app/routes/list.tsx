import { useState, useEffect } from "react";
import { useLoaderData } from "react-router";
import type { Route } from "./+types/list";
import {neon} from "@neondatabase/serverless";
import { redirect } from "react-router";
import {env} from "cloudflare:workers";
import { createAuth } from "~/auth";

type Todo = {
  number: number;
  task: string;
};

export async function loader({  request, context, params }: Route.LoaderArgs) {
  const auth = createAuth(context.cloudflare.env);

  const session = await auth.api.getSession({
    headers: request.headers,
  });
  console.log(session)
  if (!session) {
    throw redirect("/");
  }

  const DATABASE_URL = env.NEON_DATABASE_URL;

  if (!DATABASE_URL) {
    throw new Response("Missing NEON_DATABASE_URL", { status: 500 });
  }

  const sql = neon(DATABASE_URL);
  const userId = session.user.id;

  try {
    const rows = await sql`
      SELECT task, number
      FROM public."ToDoItems"
      WHERE "user" = ${userId}
      ORDER BY number
    `;

    console.log("DB rows:", rows);
    return {
      todos: rows,
      user: session.user,
    };
  } catch (err) {
    console.log("FULL ERROR:", JSON.stringify(err, null, 2));
    throw err;
  }
}

export async function action({
  request, context, params
}: Route.ActionArgs) {
  const auth = createAuth(context.cloudflare.env);
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    throw redirect("/");
  }

  const userId = session.user.id;
  let formData = await request.formData();
  let intent = formData.get("intent");
  let task = formData.get("task");
  const DATABASE_URL = env.NEON_DATABASE_URL;
  if (!DATABASE_URL) {
    throw new Response("Missing NEON_DATABASE_URL", { status: 500 });
  }
  const sql = neon(DATABASE_URL);

  if (intent === "delete") {
    await sql`
      DELETE FROM public."ToDoItems"
      WHERE "user" = ${userId}
        AND task = ${task}
    `;

    return null;
  }

  await sql`INSERT INTO public."ToDoItems" ("user", task, number) VALUES (${userId}, ${task}, 1)`
  return null;
}

function ToDoList() {
  /* const [ToDos, setToDos] = useState<Todo[]>(useLoaderData()) */
  const { todos, user } = useLoaderData<{
    todos: Todo[];
    user: { id: string; email: string; name: string };
  }>();
  const [text, setText] = useState("")

  return(
    <div style={{display:"flex", flexDirection:"column"}}>
      <h2>Your To Dos</h2>
      <form method="post" style={{display:"flex", flexDirection:"column"}}>
        <input name="task" style = {{marginTop:"5px"}} placeholder='...' value={text} onChange={(e) => setText(e.target.value)}></input>
        <button style = {{marginTop:"5px"}} type = 'submit'>Add Task</button>
      </form>
      <div>{
        todos.map((todo) => 
        <div key={todo.number} style={{display: "flex", alignItems: "center", gap: "8px" }}>
          <span>{todo.task}</span>
          <form method="post">
            <button type="submit" name="intent" value="delete" style={{
            border: "solid white 1px",
            background: "transparent",
            cursor: "pointer",
            color: "red",
            fontWeight: "bold",
            }}>X</button>
            <input type="hidden" name="task" value={todo.task}/>
          </form>
        </div>)
      }</div>
    </div>
  )
}

export default function ProtectedToDoList(){
 return <ToDoList/>
}