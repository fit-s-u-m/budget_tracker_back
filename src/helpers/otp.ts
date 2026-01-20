import crypto, { randomInt, timingSafeEqual } from "crypto"
import valkey from "@/valkey"
import db from "@/db";
import { eq } from "drizzle-orm";
import { user } from "@/db/schema"
const MAX_RETRIES = 3;
const hash = (value: string) => crypto.createHash("sha256").update(value).digest("hex");

// ----------------------- generate otp ----------------------------------


export const generateOTP = async (user_name: string, expireTimeMin: number): Promise<number> => {
  const otp = randomInt(100000, 1000000);
  const expireTimeMs = expireTimeMin * 60000
  const hashedOtp = hash(otp.toString())
  await valkey.set(`otp-${user_name}`, hashedOtp, "EX", expireTimeMs)
  await valkey.set(`otp-retry-${user_name}`, 0, "EX", expireTimeMs);

  return otp;
}

// ----------------------- verify otp ----------------------------------

export const verifyOTP = async (user_name: string, otp: number) => {
  const hashedInputOtp = hash(otp.toString())
  const storedOtp = await valkey.get(`otp-${user_name}`)
  if (!storedOtp) throw new Error("user doesn't have otp generated or otp expired")

  // Added this to prevent timing attacks
  const storedBuffer = Buffer.from(storedOtp, "hex");
  const inputBuffer = Buffer.from(hashedInputOtp, "hex");

  if (
    storedBuffer.length !== inputBuffer.length ||
    !timingSafeEqual(storedBuffer, inputBuffer)
  ) {
    const retries = await valkey.incr(`otp-retry-${user_name}`)
    if (retries >= MAX_RETRIES) {
      await valkey.del(`otp-${user_name}`);
      throw new Error("Too many incorrect attempts. OTP invalidated, generate a new one.");
    }
    throw new Error(`otp not correct, Retry count: ${retries}`);
  }
  const loggedInUser = await db.query.user.findFirst({ where: eq(user.name, user_name) })
  if (!loggedInUser) throw new Error(`There is not account created with this username ${user_name}`)
  await valkey.del(`otp-${user_name}`);
  await valkey.del(`otp-retry-${user_name}`);
  return { user_id: loggedInUser.id }
}
