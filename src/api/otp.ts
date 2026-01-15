import { Hono } from "hono"
import { eq } from "drizzle-orm"
import { db } from "@/db"; // your db type
import { otps } from "@/db/schema"
import { verifyOtp } from "@/validators/otp";
import { zValidator } from "@hono/zod-validator";
import {isPast} from "date-fns"

const app = new Hono()

app.post("/verify", zValidator("json", verifyOtp), async (c) => {

  const validOtp = c.req.valid('json')
  const otp = await db.query.otps.findFirst({where: eq(otps.otp, validOtp.otp)})
  if (!otp) {
    return c.json({ error: "Invalid OTP" }, 400);
  }
  if(isPast(otp.expires_at)){
    await db.delete(otps).where(eq(otps.otp, otp.otp))
    return c.json({ error: "OTP Expired" }, 400);
  }
  await db.delete(otps).where(eq(otps.otp, otp.otp))
  return c.json({ otp: otp.user_id}, 200)
})
