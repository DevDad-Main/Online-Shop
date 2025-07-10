import { Router } from "express";
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
router.get("/cart", getCart);
router.post("/cart", postCart);
router.post("/cart-delete-item", postCartDeleteProduct);
router.post("/create-order", postOrder);
router.get("/orders", getOrders);
// // router.get("/checkout", shopController.getCheckout);
export default router;
