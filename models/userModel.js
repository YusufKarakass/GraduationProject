import mongoose from "mongoose";
import bcrypt from "bcrypt";
import validator from "validator";

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    firstname: {
      type: String,
      required: [true, "Firstname area is required"],
      lowercase: true,
      validate: [validator.isAlphanumeric, "Only Alphanumeric characters"],
    },

    lastname: {
      type: String,
      required: [true, "Lastname area is required"],
      lowercase: true,
      validate: [validator.isAlphanumeric, "Only Alphanumeric characters"],
    },

    email: {
      type: String,
      required: [true, "Email area is required"],
      unique: true,
      validate: [validator.isEmail, "Valid email is required"],
    },
    password: {
      type: String,
      required: [true, "Password area is required"],
      minLength: [4, "At least 4 characters"],
    },
    profilePhoto: {
      type: String,
      default: "/uploads/default.jpeg",
    },
  },

  {
    timestamps: true,
  }
);

userSchema.pre("save", function (next) {
  const user = this;

    if (!user.isModified("password")) {
    return next();
  }

  bcrypt.hash(user.password, 10, (err, hash) => {
    user.password = hash;
    next();
  });
});

const User = mongoose.model("User", userSchema);

export default User;
