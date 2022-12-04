const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
dotenv.config();
const app = express();
const userRouter = require("./Routers/UserRouter");
const postRouter = require("./Routers/PostRouter");
const cors = require("cors");

app.use(express.json());
app.use(cors());

const port = process.env.PORT || 5000;

mongoose
  .connect(process.env.mongoose_url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connetc");
  })
  .catch(error => console.log(`${error} did not connect.`));

app.get("/api", (req, res) => {
  console.log("good");
  res.status(200).json({ msg: "How everthing goo" });
});
app.use("/api/user", userRouter);
app.use("/api/post", postRouter);

app.listen(port, () => {
  console.log(`Server Running on PORT ${port}`);
});
