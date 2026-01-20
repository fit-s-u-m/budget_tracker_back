import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { db } from "@/db"; // your db type
import { zValidator } from "@hono/zod-validator";
import { createUserSchema } from "@/validators/user";
import { user } from "@/db/schema";


const app = new Hono();

app.get("/:userId", async (c) => {
  const userId = c.req.param("userId")
  if (!userId || isNaN(Number(userId))) {
    return c.json({ error: "Invalid userId" }, 400)
  }
  try {
    const userIdInt = Number(userId);
    const userFetched = await db.query.user.findFirst({
      where: eq(user.id, userIdInt),
    });
    if (!userFetched) {
      return c.json({ error: "User not found" }, 404)
    }
    return c.json(userFetched, 200)
  } catch (error) {
    return c.json({ error: "Server error" }, 500)
  }
})

app.post("/", zValidator("json", createUserSchema), async (c) => {
  const validatedUser = c.req.valid("json");
  try {
    const inserted = await db.insert(user)
      .values({ ...validatedUser })
      .returning({ id: user.id });

    return c.json({ message: `User created ${validatedUser.name}`, id: inserted[0].id }, 201);
  } catch (err) {
    return c.json({ error: (err as Error).message }, 400);
  }
});
export default app
