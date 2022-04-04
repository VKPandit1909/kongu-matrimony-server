const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const arrivalsSchema = new Schema({
  register_number: { type: Number, required: true },
  name: { type: String, required: true },
  age: { type: Number, required: true },
  birth_place: { type: String, required: true },
  education: { type: String, required: true },
  family_god: { type: String, required: true },
  horoscope: { type: String, required: true },
  zodiac_sign: { type: String, required: true },
});

module.exports = mongoose.model("Arrivals", arrivalsSchema);
