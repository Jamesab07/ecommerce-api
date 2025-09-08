const mongoose = require("mongoose");
const dotenv = require("dotenv");
const fs = require("fs");
const Product = require("../models/productModel");
const Shipping = require("../models/shippingModel");
const colors = require("colors");

dotenv.config({ path: ".env" });

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose.connect(DB).then(() => {
  console.log("welcome from the database");
});

//Read JSON file
const product = JSON.parse(
  fs.readFileSync(`${__dirname}/product.json`, "utf-8")
);
const shipping = JSON.parse(
  fs.readFileSync(`${__dirname}/shipping.json`, "utf-8")
);

//Import Data Into DB
const importData = async () => {
  try {
    await Product.create(product, { validateBeforeSave: false });
    await Shipping.create(shipping, { validateBeforeSave: false });
    console.log("data successfully loaded ".green.inverse);
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

//Delete Data From DB
const deleteData = async () => {
  try {
    await Product.deleteMany();
    await Shipping.deleteMany();

    console.log("Data Succesfully Deleted".red.inverse);
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === "--import") {
  importData();
} else if (process.argv[2] === "--delete") {
  deleteData();
}
