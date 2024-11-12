import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { collection: "userInfo" } // Specify the collection name
);

module.exports = User = mongoose.model("users", userSchema);
