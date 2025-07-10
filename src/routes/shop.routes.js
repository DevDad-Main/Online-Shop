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
} from "../controllers/shop.controllers.js";

const router = Router();
// Starting Page
router.get("/", getIndex);
router.get("/products", getProducts);
// // Adding the :id or whatever the variable name will be dynamic.
// // Then we also exxtract those details later.
// // Essentiallyy tells express to look for a route like /products/1
// // -> Allowing use to extract the id
router.get("/products/:productId", getProduct);
router.get("/cart", isAuth, getCart);
router.post("/cart", isAuth, postCart);
router.post("/cart-delete-item", isAuth, postCartDeleteProduct);
router.post("/create-order", isAuth, postOrder);
router.get("/orders", isAuth, getOrders);

export default router;
