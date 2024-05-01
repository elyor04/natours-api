require("dotenv").config();

const mongoose = require("mongoose");
const app = require("./app");
const port = process.env.PORT || 3000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Database connected successfully!"))
  .catch(() => console.log("Failed to connect to database!"));

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
