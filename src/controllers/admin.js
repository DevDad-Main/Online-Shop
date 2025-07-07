import Product, { findById, fetchAll, deleteById } from "../models/product";

function getAddProduct(req, res, next) {
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

function postAddProduct(req, res, next) {
  // Creating our class product here so we can define new products whenver the admin makes one

  //TODO: Convert this into a destructured object for readability
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const description = req.body.description;
  const price = req.body.price;

  // Passing in null here for the User Id as we don't have it
  const product = new Product(
    title,
    price,
    description,
    imageUrl,
    null,
    req.user._id,
  );

  product
    .save()
    .then((result) => {
      console.log("Created Product");
      res.redirect("/admin/products");
    })
    .catch((err) => {
      console.log(err);
    });
}

function getEditProduct(req, res, next) {
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

function postEditProduct(req, res, next) {
  // Retreiving this from the hidden input only if we are in edit mode
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedImageUrl = req.body.imageUrl;
  const updatedDesc = req.body.description;
  // Now when we pass in the id in the save method we will enter the if block which in turns updates the current product we are on with the new details we pass in

  const product = new Product(
    updatedTitle,
    updatedPrice,
    updatedDesc,
    updatedImageUrl,
    prodId,
  );

  product
    .save()
    .then((result) => {
      console.log("Updated Product");
      res.redirect("/admin/products");
    })
    .catch((err) => console.log(err));
}

function getProducts(req, res, next) {
  fetchAll().then((products) => {
    res.render("admin/products", {
      prods: products,
      pageTitle: "Admin Products",
      path: "/admin/products",
    });
  });
}

function postDeleteProduct(req, res, next) {
  const prodId = req.body.productId;

  deleteById(prodId)
    .then(() => {
      console.log("Destroyed Product");
      res.redirect("/admin/products");
    })
    .catch((err) => console.log(err));

  // call back so we only get redirected back to the admin products page once we have successffully deleted a product
}

export {
  getAddProduct,
  postAddProduct,
  getEditProduct,
  postEditProduct,
  getProducts,
  postDeleteProduct,
};
