import { Client, RemoteAuth } from "whatsapp-web.js";
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
    console.log("Client is ready!");
  });

  client.on("message", (msg) => {
    if (msg.body == "!ping") {
      client.sendMessage(msg.from, "pong");
    }
  });

  return client;
}
