import mongoose, { model } from "mongoose";
const { Schema } = mongoose;

// Definisikan skema untuk user
const UserDetail = new Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { collection: "userInfo" } 
);

// Buat model berdasarkan skema dan ekspor
const User = model("User", UserDetail);
export default User;
