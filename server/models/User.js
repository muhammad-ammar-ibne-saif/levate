const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    firstName:  { type: String, required: true, trim: true },
    lastName:   { type: String, required: true, trim: true },
    email:      { type: String, required: true, unique: true, lowercase: true, trim: true },
    password:   { type: String, required: true, minlength: 6 },
    mobile:     { type: String, default: "" },
    avatar:     { type: String, default: "" },
    pushToken:  { type: String, default: "" },
    goals:      { type: [String], default: ["race"] },
    daysPerWeek: { type: Number, default: 4 },
    currentWeek:    { type: Number, default: 1 },
    currentProgram: { type: String, default: "8-Week Hybrid Foundation" },
    notificationsEnabled: { type: Boolean, default: true },
    isAdmin:    { type: Boolean, default: false },   // ← admin flag
    resetCode:        { type: String },
    resetCodeExpires: { type: Number }, 
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.resetCode;
  delete obj.resetCodeExpires;
  return obj;
};

module.exports = mongoose.model("User", userSchema);
