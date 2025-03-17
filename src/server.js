const express = require("express");
const userRoutes = require("./routes/userRoutes");
const path = require("path");
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

app.get("/",(req,res) => {
    res.sendFile(path.join(__dirname,"./public/signup.html"));
})

app.use('/user',userRoutes);

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});