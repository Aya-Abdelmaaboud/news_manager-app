const jwt = require("jsonwebtoken");
const Reporter = require("../models/reporter");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decode = jwt.verify(token, "newstask");
    const reporter = await Reporter.findOne({ _id: decode._id, tokens: token });
    if (!reporter) {
      throw new Error();
    }
    req.reporter = reporter;
    next();
  } catch (e) {
    res.status(401).send("please authenticate");
  }
};

module.exports = auth;
