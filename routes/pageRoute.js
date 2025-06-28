import express from "express";
import * as pageController from "../controllers/pageController.js"
import * as authMiddleware from "../middlewares/authMiddleware.js"

const router = express.Router();

router
.route("/")
.get( pageController.getIndexPage);

router.route("/register").get(pageController.getRegisterPage);
router.route("/login").get(pageController.getLoginPage);
router.route("/logout").get(pageController.getLogout);
router.route("/contact").get(pageController.getContactPage);
router.route("/contact").post(pageController.sendMail)
router.route("/dashboard").get(authMiddleware.authenticateToken, pageController.getDashboardPage);
router.get("/reset-password", pageController.getReset);
router.get("/reset-password/:token", pageController.getNew);

export default router;