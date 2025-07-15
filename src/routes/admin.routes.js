import { Router } from "express";
import { isAuth } from "../middleware/isAuth.middleware.js";
import {
  getAddProduct,
  getProducts,
  postAddProduct,
  getEditProduct,
  postEditProduct,
  postDeleteProduct,
} from "../controllers/admin.controllers.js";
import { postAddEditProduct } from "../util/expressValidator.util.js";

const router = Router();

//INFO: We can add as many handlers as we want and they will get processed from left to right.
//So First we will check to see if we are authenticated before going to our routes, so we don't diplay content which a non user isn't meant to see
router.get("/add-product", postAddEditProduct, isAuth, getAddProduct);
router.get("/products", isAuth, getProducts);
router.post("/add-product", postAddEditProduct, isAuth, postAddProduct);
router.get("/edit-product/:productId", isAuth, getEditProduct);
router.post("/edit-product", postAddEditProduct, isAuth, postEditProduct);
router.post("/delete-product", isAuth, postDeleteProduct);

export default router;
