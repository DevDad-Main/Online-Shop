const Product = require("../models/product");

exports.getAddProduct = (req, res, next) => {
  // This wont't specifically move onto the next middleware.
  // As we need to specify the next keyword;
  // res.sendFile(path.join(rootDir, "views", "add-product.html"));
  res.render("add-product", {
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
  const product = new Product(req.body.title);
  product.save();
  res.redirect("/");
};

exports.getProducts = (req, res, next) => {
  // fetchAll Takes in a function -> Higher order function and then it will execute this once it has done
  // As our .fetchAll uses asynchronous functions so we use this callback to deal with our products data
  Product.fetchAll((products) => {
    res.render("shop", {
      prods: products,
      docTitle: "Shop",
      path: "/",
      pageTitle: "Shop",
      hasProducts: products.length > 0,
    });
  });
};
