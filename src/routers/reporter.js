const express = require("express");
const router = express.Router();
const multer = require("multer");
const Reporter = require("../models/reporter");
const auth = require("../middleware/auth");

const uploads = multer({
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|png|jpeg|jfif)$/)) {
      return cb(new Error("please upload an image"));
    }
    cb(null, true);
  },
});

router.post("/signup", async (req, res) => {
  try {
    const reporter = new Reporter(req.body);
    const token = await reporter.generateToken();
    await reporter.save();
    res.status(200).send({ reporter, token });
  } catch (e) {
    res.status(400).send(e.message);
  }
});

router.post("/login", async (req, res) => {
  try {
    const reporter = await Reporter.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await reporter.generateToken();
    res.status(200).send({ reporter, token });
  } catch (e) {
    res.status(400).send(e.message);
  }
});

router.post(
  "/profilePicture",
  auth,
  uploads.single("image"),
  async (req, res) => {
    try {
      req.reporter.personalImg = req.file.buffer;
      await req.reporter.save();
      res.status(200).send();
    } catch (e) {
      res.status(400).send(e.message);
    }
  }
);

router.get("/profile", auth, async (req, res) => {
  res.status(200).send(req.reporter);
});

router.patch("/updateReporter", auth, async (req, res) => {
  try {
    const upadtes = Object.keys(req.body);
    const allowedUpdates = ["password", "phoneNumber"];
    const isValid = upadtes.every((el) => allowedUpdates.includes(el));
    if (!isValid) {
      throw new Error("the update is not allowed");
    }
    upadtes.forEach((el) => (req.reporter[el] = req.body[el]));
    await req.reporter.save();
    res.status(200).send(req.reporter);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

router.delete("/deleteReporter", auth, async (req, res) => {
  try {
    await req.reporter.deleteOne({ _id: req.reporter._id });
    res.status(200).send(req.reporter);
  } catch (e) {
    res.status(500).send();
  }
});

module.exports = router;
