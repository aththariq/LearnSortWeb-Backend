import mongoose, { model } from "mongoose";
var { Schema } = mongoose;

var userSchema = new Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { collection: "userInfo" }
); // nama koleksi 'userInfo'

export default model("User", userSchema); // nama model 'User'
