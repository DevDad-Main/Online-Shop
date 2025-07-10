import { Router } from "express";
import { get404 } from "../controllers/error.controllers.js";

const router = Router();

router.get("404", get404);

export default router;
