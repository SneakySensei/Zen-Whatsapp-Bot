import * as dotenv from "dotenv";
import fastify from "fastify";
import mongoose from "mongoose";

import createWhatsappBot from "./services/whatsappBot";

import { assertExists } from "./utils";

dotenv.config();

(async function () {
  await mongoose.connect(assertExists(process.env.MONGODB_URI));

  const client = await createWhatsappBot();

  const app = fastify();

  app.post("/start", async (req, res) => {
    // start client asynchrnously
    if (!client.pupPage || client.pupPage.isClosed()) {
      await client.initialize();
      await client.sendPresenceUnavailable();
    }

    res.status(200).send({
      success: true,
      message: "Bot started. Happy Detoxing!",
    });
  });

  app.post("/stop", async (req, res) => {
    // stop client
    if (client.pupPage && !client.pupPage.isClosed()) {
      await client.destroy();
    }

    res
      .status(200)
      .send({ success: true, message: "Bot Stopped. Welcome Back!" });
  });

  app.setErrorHandler(function (error, req, res) {
    // Log error
    console.error(error);
    // Send error response
    res.status(409).send({ ok: false });
  });

  const startServer = async () => {
    try {
      await app.listen({ port: parseInt(assertExists(process.env.PORT)) });
      const address = app.server.address();
      const port = typeof address === "string" ? address : address?.port;

      console.log("✅ Server started on", port);
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  };
  startServer();
})();
