import { otps } from "@/db/schema"
import { eq } from "drizzle-orm"
import  { db } from "@/db";
import { randomInt } from "crypto";

// ----------------------- generate otp ----------------------------------

export const generateOTP = async (user_id:number,expireTime:number): Promise<number> => {
  const otp = randomInt(100000, 1000000); 
  await db.delete(otps).where(eq(otps.user_id, user_id));
  await db.insert(otps).values({
    otp,
    user_id,
    expires_at: new Date(Date.now() + expireTime * 60000).toISOString()
  })

  return otp;
}

