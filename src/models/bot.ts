import mongoose from "mongoose";

const BotSchema = new mongoose.Schema({
  active: {
    type: Boolean,
    required: true,
  },
});

const BotModel = mongoose.model("Bot", BotSchema);
export default BotModel;
