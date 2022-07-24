const mongoose = require("mongoose");
const validator = require("validator");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");

reporterSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  age: {
    type: Number,
    default: 20,
    validate(value) {
      if (value < 18) {
        throw new Error("please enter valid age");
      }
    },
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    unique: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error("please enter valid email");
      }
    },
  },
  password: {
    type: String,
    required: true,
    minLength: 6,
    validate(value) {
      const passwordRegex = new RegExp(
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])"
      );
      if (!passwordRegex.test(value)) {
        throw new Error("please enter strong password");
      }
    },
  },
  personalImg: {
    type: Buffer,
  },
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
    validate(value) {
      if (!validator.isMobilePhone(value, "ar-EG")) {
        throw new Error("please enter valid phone number");
      }
    },
    // validate(value) {
    //   const mobileRegex = new RegExp("^01[0125][0-9]{8}$");
    //   if (!mobileRegex.test(value)) {
    //     throw new Error("please enter valid phone number");
    //   }
    // },
  },
  tokens: [
    {
      type: String,
      required: true,
    },
  ],
});

reporterSchema.virtual("news", {
  ref: "New",
  localField: "_id",
  foreignField: "reporter",
});

reporterSchema.pre("save", async function () {
  const reporter = this;
  if (reporter.isModified("password")) {
    const hashedPassword = await bcryptjs.hash(reporter.password, 8);
    reporter.password = hashedPassword;
  }
});

reporterSchema.statics.findByCredentials = async (email, password) => {
  const reporter = await Reporter.findOne({ email });
  if (!reporter) {
    throw new Error("the email or password is invalid");
  }
  const isMatch = await bcryptjs.compare(password, reporter.password);
  if (!isMatch) {
    throw new Error("the email or password is invalid");
  }
  return reporter;
};

reporterSchema.methods.generateToken = async function () {
  const reporter = this;
  const token = jwt.sign({ _id: reporter._id.toString() }, "newstask");
  console.log(token);
  reporter.tokens.push(token);
  await reporter.save();
  return token;
};

reporterSchema.methods.toJSON = function () {
  const reporter = this;
  const reporterObject = reporter.toObject();
  delete reporterObject.password;
  delete reporterObject.tokens;
  return reporterObject;
};

const Reporter = mongoose.model("Reporter", reporterSchema);
module.exports = Reporter;
