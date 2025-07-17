import { Router } from "express";
import { isAuth } from "../middleware/isAuth.middleware.js";
import {
  getIndex,
  getProducts,
  getProduct,
  getCart,
  postCart,
  postCartDeleteProduct,
  postOrder,
  getOrders,
  getInvoice,
} from "../controllers/shop.controllers.js";

const router = Router();

//#region INFO: Get Routes
router.get("/", getIndex);
router.get("/products", getProducts);
router.get("/products/:productId", getProduct);
router.get("/cart", isAuth, getCart);
router.get("/orders", isAuth, getOrders);
router.get("/orders/:orderId", isAuth, getInvoice);
//#endregion

//#region INFO: Post Routes
router.post("/cart", isAuth, postCart);
router.post("/cart-delete-item", isAuth, postCartDeleteProduct);
router.post("/create-order", isAuth, postOrder);
//#endregion

export default router;
