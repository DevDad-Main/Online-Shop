import { Product } from "../models/product.models.js";

export function getAddProduct(req, res, next) {
  if (!req.session.isLoggedIn) {
    return res.redirect("/login");
  }
  // This wont't specifically move onto the next middleware.
  // As we need to specify the next keyword;
  // res.sendFile(path.join(rootDir, "views", "add-product.html"));
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    // This can stay like this as this is only sed to highlight
    // The naviagtion item, the page we are on essentially
    path: "/admin/add-product",
    editing: false,
  });
  // console.log(rootDir);
}

export function postAddProduct(req, res, next) {
  // Creating our class product here so we can define new products whenver the admin makes one

  //TODO: Convert this into a destructured object for readability
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const description = req.body.description;
  const price = req.body.price;

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
      console.log(err);
    });
}

export function getEditProduct(req, res, next) {
  // This extracted value is always a string so we need to do a check for that also
  const editMode = req.query.edit;

  // Redundant we can remove it later as if we are here in this controller then we are obviously going to want to edit a product
  if (!editMode) {
    return res.redirect("/");
  }
  const prodId = req.params.productId;
  findById(prodId)
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
      });
    })
    .catch((err) => console.log(err));
}

export function postEditProduct(req, res, next) {
  // Retreiving this from the hidden input only if we are in edit mode
  const prodId = req.body.productId;
  const { title, price, imageUrl, description } = req.body;

  findById(prodId)
    .then((product) => {
      if (product.userId.toString() !== req.user._id.toString()) {
        // If we are not the original creator of this product then we they get redirected
        return res.redirect("/");
      }

      //INFO: Calling save on an exisiting product (Like we are doing below) won't actually create a new one, but it will update it with the new values we asssign above
      product.title = title;
      product.price = price;
      product.description = description;
      product.imageUrl = imageUrl;

      return product.save().then((result) => {
        console.log("Updated Product");
        res.redirect("/admin/products");
      });
    })
    .catch((err) => console.log(err));
}

export function getProducts(req, res, next) {
  //INFO: Populate will tell mongoose to populate a certain field with all the detail information and not just the id
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
    });
}

export function postDeleteProduct(req, res, next) {
  const prodId = req.body.productId;

  // Now both fields have to match for a user to delete their product
  Product.deletOne({ _id: prodId, userId: req.user._id })
    .then(() => {
      console.log("Destroyed Product");
      res.redirect("/admin/products");
    })
    .catch((err) => console.log(err));

  // call back so we only get redirected back to the admin products page once we have successffully deleted a product
}
