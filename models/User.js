import { Schema, model } from "mongoose";

// Define the schema with a specific collection name ("userInfo")
const userSchema = new Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { collection: "userInfo" } // Specify the collection name
);

// Create the model with the specified collection name and export it
const User = model("User", userSchema);
export default User;
