import { errorWrapper } from "../util/errorWrapper.util.js";
import { Product } from "../models/product.models.js";
import { validationResult } from "express-validator";
import deleteFile from "../util/file.util.js";
// import { ApiError } from "../util/ApiError.util.js";
import path from "path";

//#region get Add Product
export function getAddProduct(req, res, next) {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    hasError: false,
    editing: false,
    errorMessage: null,
    validationErrors: [],
  });
}
//#endregion

//#region Post Add Product
export function postAddProduct(req, res, next) {
  const { title, description, price } = req.body;
  const image = req.file;
  console.log(image);

  if (!image) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      editing: false,
      hasError: true,
      product: {
        title: title,
        price: price,
        description: description,
      },
      errorMessage: "Attached file is not an image",
      validationErrors: [],
    });
  }

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      editing: false,
      hasError: true,
      product: {
        title: title,
        price: price,
        imageUrl: imageUrl,
        description: description,
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }

  //WARN: We need to split this string due to how our path and project is setup See git commit regarding this.
  let path = image.path;
  const imageUrl = path.slice(path.indexOf("/images") + 1);

  const product = new Product({
    title: title,
    price: price,
    description: description,
    imageUrl: imageUrl,
    // Don't need to use the _id here as we are using mongoose, mongoose will pick it up automatically
    userId: req.user,
  });

  product
    // Don't need to change our save method here as this actually comes from mongoose
    .save()
    .then((result) => {
      console.log("Created Product");
      res.redirect("/admin/products");
    })
    .catch((err) => {
      //#region INFO: Displaying all our info again will get cumbersome and repetative
      // return res.status(422).render("admin/edit-product", {
      //   pageTitle: "Add Product",
      //   path: "/admin/add-product",
      //   editing: false,
      //   hasError: true,
      //   product: {
      //     title: title,
      //     imageUrl: imageUrl,
      //     price: price,
      //     description: description,
      //   },
      //   errorMessage: "Database error, please try again.",
      //   validationErrors: [],
      // });
      //#endregion

      //#region INFO: Could redirect too our 500 page as this is a databse server side issue -> Instead use Error Handling
      // res.redirect("/500");
      //#endregion

      errorWrapper(next, err);
    });
}
//#endregion

//#region Get Edit Product
export function getEditProduct(req, res, next) {
  const editMode = req.query.edit;

  if (!editMode) {
    return res.redirect("/");
  }
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then((product) => {
      if (!product) {
        return res.redirect("/");
      }
      res.render("admin/edit-product", {
        pageTitle: "Edit Product",
        // This can stay like this as this is only sed to highlight
        // The naviagtion item, the page we are on essentially
        path: "/admin/edit-product",
        // variable we can pass over and check if to see if we
        // click the save button, we should try to add the product or edit and update
        editing: editMode,
        product: product,
        hasError: false,
        errorMessage: null,
        validationErrors: [],
      });
    })
    .catch((err) => {
      errorWrapper(next, err);
    });
}
//#endregion

//#region Post Edit Product
export function postEditProduct(req, res, next) {
  // Retreiving this from the hidden input only if we are in edit mode
  const prodId = req.body.productId;
  const { title, price, description } = req.body;
  const image = req.file;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: "/admin/edit-product",
      editing: true,
      hasError: true,
      product: {
        title: title,
        price: price,
        description: description,
        _id: prodId, // We need to resend the product id, when we refresh it looses its refernece to the item we were editing
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }

  Product.findById(prodId)
    .then((product) => {
      if (product.userId.toString() !== req.user._id.toString()) {
        // If we are not the original creator of this product then we they get redirected
        return res.redirect("/");
      }

      //INFO: Calling save on an exisiting product (Like we are doing below) won't actually create a new one, but it will update it with the new values we asssign above
      product.title = title;
      product.price = price;
      product.description = description;
      if (image) {
        deleteFile(path.join("src", product.imageUrl));
        //WARN: We need to split this string due to how our path and project is setup See git commit regarding this.
        let imgPath = image.path;
        const result = imgPath.slice(imgPath.indexOf("/images") + 1);
        product.imageUrl = result;
      }

      return product.save().then((result) => {
        console.log("Updated Product");
        res.redirect("/admin/products");
      });
    })
    .catch((err) => errorWrapper(next, err));
}
//#endregion

//#region Get Products
export function getProducts(req, res, next) {
  Product.find({
    userId: req.user._id,
  })
    // .populate("userId", "name")
    .then((products) => {
      console.log(products);
      res.render("admin/products", {
        prods: products,
        pageTitle: "Admin Products",
        path: "/admin/products",
      });
    })
    .catch((err) => {
      errorWrapper(next, err);
    });
}
//#endregion

//#region Post Delete Product
export function postDeleteProduct(req, res, next) {
  const prodId = req.body.productId;

  Product.findById(prodId)
    .then((product) => {
      if (!product) {
        return next(new Error("Product not found"));
      }
      // Need to rejoin our path due to us slicing it when we save it
      deleteFile(path.join("src", product.imageUrl));
      // Returning the delete one call here so we avoid having a race condition incase the product gets delete before we actually find it
      return Product.deleteOne({ _id: prodId, userId: req.user._id });
    })

    .then(() => {
      console.log("Destroyed Product");
      res.redirect("/admin/products");
    })
    .catch((err) => errorWrapper(next, err));

  // call back so we only get redirected back to the admin products page once we have successffully deleted a product
}
//#endregion
