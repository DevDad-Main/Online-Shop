import { Product } from "../models/product.models.js";
import { Order } from "../models/order.models.js";
import Tokens from "csrf";

const tokens = new Tokens();

export function getProducts(req, res, next) {
  //INFO: Find here does not return us a cursor it returns us all the products
  //WARN: We should turn this into a cursor when working with large amounts of data, or manipulate .find() to limit the data returned using pagination
  Product.find()
    .then((products) => {
      console.log(products);
      res.render("shop/product-list", {
        prods: products,
        docTitle: "All Products",
        path: "/products",
        pageTitle: "Shop",
      });
    })
    .catch((err) => console.log(err));
}

export function getProduct(req, res, next) {
  // This has to be exactly the same as we defined in the route :id
  // Allowing us to extract it from the url parameters
  //INFO: mongoose comes with a findById so we dont need to change the function called
  const prodID = req.params.productId;
  Product.findById(prodID)
    .then((product) => {
      console.log(product);
      res.render("shop/product-detail", {
        product: product,
        pageTitle: product.title,
        path: "/products",
      });
    })
    .catch((err) => console.log(err));
}

export function getIndex(req, res, next) {
  Product.find()
    .then((products) => {
      res.render("shop/index", {
        prods: products,
        path: "/",
        pageTitle: "Shop",
      });
    })
    .catch((err) => {
      console.log(err);
    });
}

export async function getCart(req, res, next) {
  await req.user
    .populate("cart.items.productId")
    .then((user) => {
      console.log(user.cart.items);
      const products = user.cart.items;
      console.log(products);
      res.render("shop/cart", {
        path: "/cart",
        pageTitle: "Your Cart",
        products: products,
      });
    })
    .catch((err) => console.log(err));
}

export function postCart(req, res, next) {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then((product) => {
      return req.user.addToCart(product);
    })
    .then((result) => {
      console.log(result);
      res.redirect("/cart");
    });
  // Assigning req.user to a newely instantiated object allowing us to access the methods of User.
  // Now we can call methods on req.user
}

export function postCartDeleteProduct(req, res, next) {
  const prodId = req.body.productId;
  req.user
    .removeFromCart(prodId)
    .then((result) => {
      res.redirect("/cart");
    })
    .catch((err) => console.log(err));
}

export async function postOrder(req, res, next) {
  await req.user
    .populate("cart.items.productId")
    .then((user) => {
      console.log(user.cart.items);
      //INFO: Remapping our returned products to a newer easier to work with object as everything is nested differently to what the order fields require
      const products = user.cart.items.map((i) => {
        //INFO: Using the _doc mongoose gives us to all of the data inside, spread operator to pull out all of the data and store it in a new object
        return { quantity: i.quantity, product: { ...i.productId._doc } };
      });
      const order = new Order({
        user: {
          email: req.user.email,
          userId: req.user._id, // mongoose picks the id automatically
        },
        products: products,
      });
      return order.save();
    })
    .then((results) => {
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect("/orders"); // Once we have claered the above cart then we redirect
    })
    .catch((err) => console.log(err));
}

export function getOrders(req, res, next) {
  //INFO: Should return us all orders that belong to user that matches the users id (The User logged in)
  Order.find({
    "user.userId": req.user._id,
  }).then((orders) => {
    res.render("shop/orders", {
      path: "/orders",
      pageTitle: "Your Orders",
      orders: orders,
    });
  });
}

//
// exports.getCheckout = (req, res, next) => {
//   res.render("shop/checkout", {
//     path: "/checkout",
//     pageTitle: "Checkout",
//   });
// };
