const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A name for this category is required"],
      unique: [true, "Category name must be unique"],
      minlength: [3, "Too short for a category name"],
      maxlength: [32, "Too long for a category name"],
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
    doc.image = `${process.env.BASE_URL}/categories/${doc.image}`;
  }
};
// findOne, findAll and update
categorySchema.post("init", (doc) => {
  setImageURL(doc);
});

// create
categorySchema.post("save", (doc) => {
  setImageURL(doc);
});

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
