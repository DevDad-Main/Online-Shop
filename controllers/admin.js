const Product = require("../models/product");

exports.getAddProduct = (req, res, next) => {
  // This wont't specifically move onto the next middleware.
  // As we need to specify the next keyword;
  // res.sendFile(path.join(rootDir, "views", "add-product.html"));
  res.render("admin/add-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    // Boolean used to activate the specific style sheets
    formCSS: true,
    // Boolean used to activate the specific style sheets
    productCSS: true,
    // Boolean passed to our ejs template to add the class active for this page
    activeAddProduct: true,
  });
  // console.log(rootDir);
};

exports.postAddProduct = (req, res, next) => {
  // Creating our class product here so we can define new products whenver the admin makes one

  //TODO: Convert this into a destructured object for readability
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const description = req.body.description;
  const price = req.body.price;
  const product = new Product(title, imageUrl, description, price);
  product.save();
  res.redirect("/");
};

exports.getProducts = (req, res, next) => {
  Product.fetchAll((products) => {
    res.render("admin/products", {
      prods: products,
      pageTitle: "Admin Products",
      path: "/admin/products",
    });
  });
};
