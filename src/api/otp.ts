import { Hono } from "hono"
import { verifyOtp } from "@/validators/otp";
import { zValidator } from "@hono/zod-validator";
import { verifyOTP } from "@/helpers/otp"


const app = new Hono()
app.post("/verify", zValidator("json", verifyOtp), async (c) => {

  try {
    const input = c.req.valid('json')
    await verifyOTP(input.userId, input.otp)
    return c.json({ message: "successfully verfied otp" }, 200)
  } catch (error) {
    return c.json({ error: (error as Error).message }, 400);
  }
})

export default app
