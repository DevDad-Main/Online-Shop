import { Router } from "express";
import {
  getLogin,
  postLogin,
  postLogout,
  getSignup,
  postSignup,
} from "../controllers/auth.controllers.js";

const router = Router();

router.get("/login", getLogin);
router.get("/signup", getSignup);

router.post("/login", postLogin);
router.post("/logout", postLogout);
router.post("/signup", postSignup);

export default router;
