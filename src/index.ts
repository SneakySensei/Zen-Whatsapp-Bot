import * as dotenv from "dotenv";
import fastify from "fastify";
import mongoose from "mongoose";

import createWhatsappBot from "./services/whatsappBot";
import { startMonitoring, stopMonitoring } from "./services/uptimeRobot";

import { assertExists, isBotMarkedActive } from "./utils";
import BotModel from "./models/bot";

dotenv.config();

(async function () {
  await mongoose.connect(assertExists(process.env.MONGODB_URI));

  const client = await createWhatsappBot();

  const startBot = async () => {
    await client.initialize();
    await client.sendPresenceUnavailable();
    await BotModel.findOneAndUpdate(
      {},
      { $set: { active: true } },
      { upsert: true }
    );
  };

  const stopBot = async () => {
    await client.destroy();
    await BotModel.findOneAndUpdate(
      {},
      { $set: { active: false } },
      { upsert: true }
    );
  };

  if (await isBotMarkedActive()) startBot();

  const app = fastify();

  app.post<{ Body: { api_key: string } }>(
    "/start",
    {
      schema: {
        body: {
          type: "object",
          properties: {
            api_key: { type: "string" },
          },
          required: ["api_key"],
        },
      },
    },
    async (req, res) => {
      if (req.body.api_key !== assertExists(process.env.API_KEY)) {
        return res
          .status(401)
          .send({ success: false, message: "Invalid API key" });
      }

      // start client asynchrnously
      if (!(await isBotMarkedActive())) {
        // If inner condition fails, the bot is still starting
        if (!client.pupPage || client.pupPage.isClosed()) {
          await startBot();
          await startMonitoring();
        }
      }

      res.status(200).send({
        success: true,
        message: "Bot started. Stay focussed!",
      });
    }
  );

  app.post<{ Body: { api_key: string } }>(
    "/stop",
    {
      schema: {
        body: {
          type: "object",
          properties: {
            api_key: { type: "string" },
          },
          required: ["api_key"],
        },
      },
    },
    async (req, res) => {
      if (req.body.api_key !== assertExists(process.env.API_KEY)) {
        return res
          .status(401)
          .send({ success: false, message: "Invalid API key" });
      }

      // stop client
      if (client.pupPage && !client.pupPage.isClosed()) {
        await stopBot();
        await stopMonitoring();
      }

      res
        .status(200)
        .send({ success: true, message: "Bot Stopped. Welcome Back!" });
    }
  );

  // ERROR HANDLER
  app.setErrorHandler(function (error, req, res) {
    // Log error
    console.error(error);
    // Send error response
    res.status(500).send({ success: false, message: "Internal Server Error" });
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
