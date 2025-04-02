const express = require("express");
const userRoutes = require("./routes/userRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const purchaseRoutes = require("./routes/purchaseRoutes");
const path = require("path");
const cors = require("cors");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const authMiddleware = require("./middleware/auth");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const fs = require('fs');


const app = express();

app.use(cors());
app.use(express.json());
const accessLogStream = fs.createWriteStream(
  path.join(__dirname,'logs','access.log'),
  {flags: 'a'}
);
app.use(morgan('combined',{stream: accessLogStream}));

app.use(helmet());
app.use(compression());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "./public/signup.html"));
  });  

app.use("/user", userRoutes);
app.use("/expense", authMiddleware, expenseRoutes);
app.use("/purchase", purchaseRoutes);


const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
