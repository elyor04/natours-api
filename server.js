const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path: `${__dirname}/config.env` });
const app = require("./app");

mongoose
  .connect(process.env.DATABASE_LOCAL)
  .then(() => console.log("Database connected successfully!"))
  .catch(() => console.log("Failed to connect to database!"));

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
