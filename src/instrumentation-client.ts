// Vercel BotID: iletişim formunun gönderildiği sayfalarda görünmez bot kontrolü.
// Form bir Server Action, yani sayfanın kendi adresine POST atıyor; sunucu tarafı lib/contact.ts.
import { initBotId } from "botid/client/core";

initBotId({
  protect: [
    { path: "/", method: "POST" },
    { path: "/hakkimizda", method: "POST" },
  ],
});
