const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const errorController = require("./controllers/error");

const app = express();
const PORT = 3000;
const rootPath = path.join(path.dirname(require.main.filename), "public");

app.set("view engine", "ejs");
// This is not neccessary as the default location express looks for is.
// cwd, current working directory + the /views/ folder
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(rootPath));

// This will automatically consider our routes in the admin.js file.
// When filing the request through the middlewares
// Filtering our route via the /admin, so now the url has to go to /admin/add-product
app.use("/admin", adminRoutes);
app.use(shopRoutes);

// This will be a catch all route, because if our middlewares above
// Have nowhere else to go then we will send a 404 status code

// Then because we are using the use route and no path as the first parameter
// This will handle all http methods and not just ehg et or post
app.use(errorController.get404);

app.listen(PORT);
