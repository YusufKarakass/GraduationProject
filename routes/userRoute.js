import express from "express"
import * as userController from "../controllers/userController.js"
import * as authMiddleware from "../middlewares/authMiddleware.js"
import upload from "../middlewares/uploadMiddleware.js";

const router = express.Router()



router.route("/register").post(userController.createUser)
router.route("/login").post(userController.loginUser)

router.route("/reset-password").post(userController.sendResetPasswordEmail);
router.route("/reset-password/:token").post(userController.resetPassword);

router.post(
  "/upload-photo",
  authMiddleware.authenticateToken,
  upload.single("photo"), // <== Burası önemli
  userController.uploadPhoto
);

router.post("/delete-photo", authMiddleware.authenticateToken, userController.deletePhoto);

 

export default router;