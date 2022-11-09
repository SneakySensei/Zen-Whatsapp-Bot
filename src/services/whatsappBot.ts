import { Client, RemoteAuth, MessageTypes } from "whatsapp-web.js";
import { MongoStore } from "wwebjs-mongo";
import qrcode from "qrcode-terminal";
import mongoose from "mongoose";

export default async function createWhatsappBot() {
  const store = new MongoStore({ mongoose: mongoose });

  const client = new Client({
    authStrategy: new RemoteAuth({
      store: store,
      backupSyncIntervalMs: 300000,
    }),
  });

  client.on("qr", (qr) => {
    // Generate and scan this code with your phone
    qrcode.generate(qr, { small: true });
  });

  client.on("ready", () => {
    console.log("📱 Bot turned on.");
  });

  client.on("disconnected", () => {
    console.log("📴 Bot turned off.");
  });

  client.on("message", async (msg) => {
    const isGroup = (await msg.getChat()).isGroup;
    const mentionsMe = (await msg.getMentions()).some(
      (contact) => contact.isMe
    );
    const isRelevantMesssage =
      msg.type === MessageTypes.TEXT ||
      msg.type === MessageTypes.AUDIO ||
      msg.type === MessageTypes.VOICE;
    setTimeout(() => {
      if ((isGroup && mentionsMe) || (!isGroup && isRelevantMesssage)) {
        client.sendMessage(
          msg.from,
          "Hi, this is Ditto, Snehil's focus bot! 🤖\n\nSnehil is currently offline but he'll get back to you soon. If it's urgent, kindly contact him through a phone call."
        );
      }
      client.markChatUnread(msg.from);
    }, Math.random() * 5000);
  });

  return client;
}
