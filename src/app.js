const express = require("express");
const reporterRouter = require("./routers/reporter");
const newsRouter = require("./routers/new")

const port = process.env.PORT || 3000;
const app = express();

require("./db/mongoose");

app.use(express.json());
app.use(reporterRouter);
app.use(newsRouter);

app.listen(port, () => console.log(`server is runing on port: ${port}`));
