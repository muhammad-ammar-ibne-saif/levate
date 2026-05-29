const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    firstName: { type: String, required: true },
    lastName:  { type: String, default: "" },
    content:   { type: String, required: true, maxlength: 1000 },
    deleted:   { type: Boolean, default: false },
    deletedAt: { type: Date },
    reported:  { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
