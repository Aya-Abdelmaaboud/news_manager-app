const express = require("express");
const router = express.Router();
const multer = require("multer");
const auth = require("../middleware/auth");
const New = require("../models/new");

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

router.post("/addNew", auth, async (req, res) => {
  try {
    const anew = new New({ ...req.body, reporter: req.reporter._id });
    await anew.save();
    res.status(200).send(anew);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

router.get("/news", auth, async (req, res) => {
  try {
    await req.reporter.populate("news");
    res.status(200).send(req.reporter.news);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

router.patch("/updateNew/:id", auth, async (req, res) => {
  try {
    const anew = await New.findOneAndUpdate(
      {
        _id: req.params.id,
        reporter: req.reporter._id,
      },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!anew) {
      return res.status(404).send("new is not found");
    }
    res.status(200).send(anew);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

router.delete("/deleteNew/:id", auth, async (req, res) => {
  try {
    const anew = await New.findOneAndDelete({
      _id: req.params.id,
      reporter: req.reporter._id,
    });
    if (!anew) {
      return res.status(404).send("new is not found");
    }
    res.status(200).send(anew);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

router.post(
  "/newPicture/:id",
  auth,
  uploads.single("image"),
  async (req, res) => {
    try {
      await req.reporter.populate("news");
      const news = req.reporter.news;
      let certainNew = news.find((el) => {
        return el._id == req.params.id;
      });
      console.log(certainNew);
      certainNew.image = req.file.buffer;
      // console.log(certainNew);
      await certainNew.save();
      res.status(200).send();
    } catch (e) {
      res.status(400).send(e.message);
    }
  }
);

module.exports = router;
