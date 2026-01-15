import {bot} from "./index"

type TxStep = "TYPE" |"CATEGORY" | "AMOUNT" | "REASON" | "CONFIRM";
interface TxState {
  step: TxStep;
  type?: "debit" | "credit";
  category?: string;
  amount?: number;
  reason?: string;
}
const txSessions = new Map<number, TxState>();

bot.command("make_transaction",async (context)=>{
  const userId = context.from.id;
  txSessions.set(userId, { step: "TYPE" });

  return await context.reply("What type of transaction would you like to make?", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "Credit", callback_data: "type_credit" }],
        [{ text: "Debit", callback_data: "type_debit" }],
        [{ text: "Cancel", callback_data: "type_cancel" }],
      ]
    }
  })
})
// bot.on("callback_query", async (ctx) => {
//   const userId = ctx.from.id;
//   const data = ctx.callbackQuery.data;
//
//   const session = txSessions.get(userId);
//   if(!session) return;
//   session.type = data === "type_credit" ? "credit" : "debit";
//
// })

// bot.command("transaction", async (ctx) => {
//   const userId = ctx.from.id;
//
//   txSessions.set(userId, { step: "CATEGORY" });
//
//   await ctx.reply("Choose a category:", {
//     reply_markup: {
//       inline_keyboard: [
//         [{ text: "🍔 Food", callback_data: "cat_food" }],
//         [{ text: "🚕 Transport", callback_data: "cat_transport" }],
//         [{ text: "🏠 Rent", callback_data: "cat_rent" }],
//         [{ text: "❌ Cancel", callback_data: "cancel_tx" }],
//       ],
//     },
//   });
// });
