import { Router } from "express";
import { get404, get500 } from "../controllers/error.controllers.js";

const router = Router();

//#region Get Routes
router.get("/404", get404);
router.get("/500", get500);
//#endregion

export default router;
