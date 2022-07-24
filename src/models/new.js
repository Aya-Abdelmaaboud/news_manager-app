const mongoose = require("mongoose");

const newSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    desc: {
      type: String,
      required: true,
      minLength: 10,
    },
    image: {
      type: Buffer,
    },
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Reporter",
    },
  },
  { timestamps: true }
);

newSchema.methods.toJSON = function () {
  const anew = this;
  const newObject = anew.toObject();
  return newObject;
};

const News = mongoose.model("New", newSchema);

module.exports = News;
