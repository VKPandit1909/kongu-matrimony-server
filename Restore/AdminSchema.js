const mongoose = require("mongoose");

const regDate = new Date().toLocaleString();
const AdminSchema = new mongoose.Schema(
  {
    address: String,
   
  },
  { collection: "AdminSchema" }
);

mongoose.model("AdminSchema", AdminSchema);
