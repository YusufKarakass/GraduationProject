import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadPhoto = async (req, res) => {
  try {
    const userId = req.user.userId;
    let filename;

    if (req.file) {
      filename = req.file.filename;
    } else if (req.body.photoData) {
      const base64Data = req.body.photoData.replace(/^data:image\/png;base64,/, '');
      filename = `photo_${Date.now()}.png`;
      const filePath = path.join(__dirname, '../public/uploads', filename);
      fs.writeFileSync(filePath, base64Data, 'base64');
    } else {
      return res.status(400).json({ error: "Fotoğraf bulunamadı." });
    }
    const user = await User.findByIdAndUpdate(userId, { profilePhoto: filename }, { new: true });
    res.redirect('/dashboard');
  } catch (error) {
    console.error("Photo upload error:", error);
    res.status(500).json({ error: "Fotoğraf yükleme sırasında hata oluştu." });
  }
};

const createUser = async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json({ user: user._id });
  } catch (error) {
    let errors2 = {};

    if (error.code === 11000) {
      errors2.email = "The email is already register";
    }

    if (error.name === "ValidationError") {
      Object.keys(error.errors).forEach((key) => {
        errors2[key] = error.errors[key].message;
      });
    }

    res.status(400).json(errors2);
  }
};

const loginUser = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      const user = await User.findOne({ email });
  
      let same = false;
  
      if (user) {
        same = await bcrypt.compare(password, user.password);
      } else {
        return res.status(401).json({
          succeeded: false,
          error: "There is no such user"
        });
      }
  
      if (same) {
        const token = createToken(user._id);
        res.cookie("jwt", token, {
          httpOnly: true,
          maxAge: 1000 * 60 * 60 * 24,
        });
        return res.json({
          succeeded: true,
          redirectUrl: "/dashboard"
        });
      } else {
        return res.status(401).json({
          succeeded: false,
          error: "Password does not match"
        });
      }
    } catch (error) {
      return res.status(500).json({
        succeeded: false,
        error: "An error occurred. Please try again later."
      });
    }
  };
  

const createToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res
        .status(404)
        .json({ succeeded: false, error: "Kullanıcı bulunamadı." });
    }

    user.password = password; // Hashleme artık modelde yapılacak
    await user.save();

    return res.status(200).json({ succeeded: true });
  } catch (error) {
    console.error("Şifre sıfırlama hatası:", error);
    return res
      .status(500)
      .json({ succeeded: false, error: "Bir hata oluştu." });
  }
};

const sendResetPasswordEmail = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ succeeded: false, error: "E-posta adresi bulunamadı." });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    const resetLink = `${req.protocol}://${req.get(
      "host"
    )}/reset-password/${token}`;

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.NODE_MAIL,
        pass: process.env.NODE_PASS,
      },
    });
    await transporter.sendMail({
      to: email,
      subject: "Şifre Sıfırlama Talebi",
      html: `<p>Şifrenizi sıfırlamak için aşağıdaki bağlantıya tıklayın:</p><a href="${resetLink}">${resetLink}</a>`,
    });

    return res.status(200).json({ succeeded: true });
  } catch (error) {
    console.error("Şifre sıfırlama e-posta hatası:", error);
    return res.status(500).json({ succeeded: false, error: "Sunucu hatası" });
  }
};
const deletePhoto = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId);

    if (!user || !user.profilePhoto) {
      return res.status(400).json({ error: "Silinecek bir fotoğraf yok." });
    }

    const photoPath = path.join(__dirname, '../public/uploads', user.profilePhoto);

    if (fs.existsSync(photoPath)) {
      fs.unlinkSync(photoPath);
    }

    user.profilePhoto = null;
    await user.save();

    res.redirect("/dashboard")
  } catch (err) {
    console.error("Fotoğraf silme hatası:", err);
    res.status(500).json({ error: "Fotoğraf silinemedi." });
  }
};
export { createUser, loginUser, sendResetPasswordEmail, resetPassword,  uploadPhoto,  deletePhoto   };
