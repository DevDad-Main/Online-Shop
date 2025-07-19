import { Router } from "express";
import { isAuth } from "../middleware/isAuth.middleware.js";
import {
  getAddProduct,
  getProducts,
  postAddProduct,
  getEditProduct,
  postEditProduct,
  deleteProduct,
} from "../controllers/admin.controllers.js";
import { postAddEditProduct } from "../util/expressValidator.util.js";

const router = Router();

//#region Get Routes
//INFO: We can add as many handlers as we want and they will get processed from left to right.
//So First we will check to see if we are authenticated before going to our routes, so we don't diplay content which a non user isn't meant to see
router.get("/add-product", postAddEditProduct, isAuth, getAddProduct);
router.get("/products", isAuth, getProducts);
router.get("/edit-product/:productId", isAuth, getEditProduct);
//#endregion

//#region Post Routes
router.post("/add-product", postAddEditProduct, isAuth, postAddProduct);
router.post("/edit-product", postAddEditProduct, isAuth, postEditProduct);
//#endregion

//#region Delete Routes
router.delete("/product/:productId", isAuth, deleteProduct);
//#endregion

export default router;
