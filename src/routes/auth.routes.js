//#region Imports
import { Router } from "express";
import {
  getLogin,
  postLogin,
  postLogout,
  getSignup,
  postSignup,
  getReset,
  postReset,
  getNewPassword,
  postNewPassword,
} from "../controllers/auth.controllers.js";
import { signupValidation } from "../util/expressValidator.util.js";
//#endregion
const router = Router();

//#region Get Routes
router.get("/login", getLogin);
router.get("/signup", getSignup);
router.get("/reset", getReset);
router.get("/reset/:token", getNewPassword);
//#endregion

//#region Post Routes
router.post("/login", postLogin);
router.post("/logout", postLogout);
router.post("/signup", signupValidation, postSignup);
router.post("/reset", postReset);
router.post("/new-password", postNewPassword);
//#endregion

export default router;
