const mongoose = require("mongoose");

const brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Brand name required"],
      unique: true,
      minlength: [3, "Brand name is too short"],
      maxlength: [32, "Brand name is too long"],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    image: String,
  },
  { timestamps: true }
);

const setImageURL = (doc) => {
  if (doc.image) {
    doc.image = `${process.env.BASE_URL}/brands/${doc.image}`;
  }
};
// findOne, findAll and update
brandSchema.post("init", (doc) => {
  setImageURL(doc);
});

// create
brandSchema.post("save", (doc) => {
  setImageURL(doc);
});

const Brand = mongoose.model("Brand", brandSchema);
module.exports = Brand;
