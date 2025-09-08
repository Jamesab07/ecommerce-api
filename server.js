const mongoose = require("mongoose");
const dotenv = require("dotenv");

//UNCAUGHT EXCEPTION
process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION");
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: ".env" });
const app = require("./app");

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose.connect(DB).then(() => {
  console.log("welcome from the database");
  //console.log(process.env);
});

//console.log(process.env);
const port = process.env.PORT || 3100;
const server = app.listen(port, () => {
  console.log("Listening");
  console.log(`server running on port ${port}`);
});

//UNHANDLED REJECTION
process.on("unhandledRejection", (err) => {
  console.log("unhandled rejection");
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
