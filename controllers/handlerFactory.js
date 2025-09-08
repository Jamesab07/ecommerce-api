const catchAsync = require("../middleware/catchAsync");
const AppError = require("../utils/appError");
const APIfeatures = require("../middleware/apiFeatures");

exports.createOne = (Model) =>
  catchAsync(async (req, res) => {
    const document = await Model.create(req.body);

    res.status(201).json({ [Model.modelName]: document });
  });

exports.getOne = (Model, popOption) =>
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    // 1) Build query
    let query = Model.findById(id);
    if (popOption) {
      query = query.populate(popOption);
    }

    // 2) Execute query
    const document = await query;

    if (!document) {
      return next(new AppError(`No document for this id ${id}`, 404));
    }

    res.status(200).json({ [Model.modelName]: document });
  });

exports.getAll = (Model, modelName = "") =>
  catchAsync(async (req, res) => {
    let filter = {};
    if (req.filterObj) {
      filter = req.filterObj;
    }
    // Build query
    const documentsCounts = await Model.countDocuments();
    const apiFeatures = new APIfeatures(Model.find(filter), req.query)
      .paginate(documentsCounts)
      .search(modelName)
      .filter()
      .limitFields()
      .sort();

    // Execute query
    const { mongooseQuery, paginationResult } = apiFeatures;
    const documents = await mongooseQuery;

    res.status(200).json({
      results: documents.length,
      pagination: paginationResult,
      [Model.modelName]: documents,
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!document) {
      return next(
        new AppError(`No document found with this ID ${req.params.id} `, 404)
      );
    }
    res.status(200).json({
      [Model.modelName]: document,
    });
  });

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const { id } = req.params;

    // Retrieve the document first
    const document = await Model.findById(id);

    if (!document) {
      return next(new AppError(`No document found for this id ${id}`, 404));
    }

    // Extract relevant fields before deletion
    const productId = document.product; // Assuming `product` field exists for models like Review

    // Call .deleteOne() to delete the document
    await document.deleteOne();

    // If the model has a calcAverageRatingsAndQuantity static method, call it
    if (
      typeof Model.calcAverageRatingsAndQuantity === "function" &&
      productId
    ) {
      await Model.calcAverageRatingsAndQuantity(productId);
    }

    res.status(204).send();
  });
