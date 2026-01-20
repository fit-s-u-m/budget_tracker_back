import crypto, { randomInt, timingSafeEqual } from "crypto"
import valkey from "@/valkey"
const MAX_RETRIES = 3;
const hash = (value: string) => crypto.createHash("sha256").update(value).digest("hex");

// ----------------------- generate otp ----------------------------------


export const generateOTP = async (user_id: number, expireTimeMin: number): Promise<number> => {
  const otp = randomInt(100000, 1000000);
  const expireTimeMs = expireTimeMin * 60000
  const hashedOtp = hash(otp.toString())
  await valkey.set(`otp-${user_id}`, hashedOtp, "EX", expireTimeMs)
  await valkey.set(`otp-retry-${user_id}`, 0, "EX", expireTimeMs);

  return otp;
}

// ----------------------- verify otp ----------------------------------

export const verifyOTP = async (user_id: number, otp: number) => {
  const hashedInputOtp = hash(otp.toString())
  const storedOtp = await valkey.get(`otp-${user_id}`)
  if (!storedOtp) throw new Error("user doesn't have otp generated or otp expired")

  // Added this to prevent timing attacks
  const storedBuffer = Buffer.from(storedOtp, "hex");
  const inputBuffer = Buffer.from(hashedInputOtp, "hex");

  if (
    storedBuffer.length !== inputBuffer.length ||
    !timingSafeEqual(storedBuffer, inputBuffer)
  ) {
    const retries = await valkey.incr(`otp-retry-${user_id}`)
    if (retries >= MAX_RETRIES) {
      await valkey.del(`otp-${user_id}`);
      throw new Error("Too many incorrect attempts. OTP invalidated, generate a new one.");
    }
    throw new Error(`otp not correct, Retry count: ${retries}`);
  }
  await valkey.del(`otp-${user_id}`);
  await valkey.del(`otp-retry-${user_id}`);
  return true
}
