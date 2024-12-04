const mongoose = require("mongoose");

const recipeSchema = new mongoose.Schema({
  label: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  source: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  ingredients: [
    {
      text: String,
      weight: Number,
    },
  ],
  calories: {
    type: Number,
  },
  totalTime: {
    type: Number,
  },
  dateAdded: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Recipe", recipeSchema);
