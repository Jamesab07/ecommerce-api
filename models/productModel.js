const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: [true, "Product must have a title"],
      minlength: [3, "Too short for a product title"],
      maxlength: [50, "Too long for product title"],
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      minlength: [20, "Too short for a product description"],
    },
    quantity: {
      type: Number,
      required: [true, "Product quantity is required"],
    },
    sold: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, "Product price is requied"],
      min: [1, "Price must be greater than 0"],
    },
    priceAfterDiscount: Number,
    imageCover: {
      type: String,
      required: [true, "Product Image cover is required"],
    },
    colors: [String],
    images: [String],
    category: {
      type: mongoose.Schema.ObjectId,
      ref: "Category",
      required: [true, "Product must belong to a category"],
    },
    subcategories: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "SubCategory",
      },
    ],
    brand: {
      type: mongoose.Schema.ObjectId,
      ref: "Brand",
    },
    ratingsAverage: {
      type: Number,
      min: [1, "Rating must be above or equal to 1"],
      max: [5, "Rating must be below or equal to 5"],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    // to enable virtual populate
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

productSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "product",
  localField: "_id",
});

// // Mongoose query middleware
productSchema.pre(/^find/, function (next) {
  this.populate({
    path: "category",
    select: "name _id",
  });
  next();
});

const setImageURL = (doc) => {
  if (doc.imageCover) {
    doc.imageCover = `${process.env.BASE_URL}/products/${doc.imageCover}`;
  }
  if (doc.images) {
    const length = doc.images.length;
    for (let i = 0; i < length; i++) {
      doc.images[i] = `${process.env.BASE_URL}/products/${doc.images[i]}`;
    }
  }
};
// findOne, findAll and update
productSchema.post("init", (doc) => {
  setImageURL(doc);
});

// create
productSchema.post("save", (doc) => {
  setImageURL(doc);
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
