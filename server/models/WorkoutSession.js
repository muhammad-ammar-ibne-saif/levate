const mongoose = require("mongoose");

const workoutSessionSchema = new mongoose.Schema(
  {
    user:            { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name:            { type: String, required: true },
    type:            { type: String, enum: ["lift", "run", "race"], required: true },
    durationMinutes: { type: Number, required: true },
    setsCompleted:   { type: Number, default: 0 },
    calories:        { type: Number, default: 0 },
    week:            { type: Number, required: true },
    program:         { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("WorkoutSession", workoutSessionSchema);
