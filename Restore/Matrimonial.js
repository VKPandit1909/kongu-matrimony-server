const mongoose = require("mongoose");

const regDate = new Date().toLocaleString();
const MatrimonialSchema = new mongoose.Schema(
  {
    name: String,
    gender: String,
    caste: String,
    email: String,
    about: String,
    photo: String,
    basic: Object,
    horoscope: Object,
    religion: Object,
    professional: Object,
    location: Object,
    family: Object,
    contact: Object,
    aboutfamily: String,
    lifestyle: Object,
    partnerpreference: Object,
    professionalprefer: Object,
    locationprefer: Object,
    lookingfor: String,
    shortlistUsers: String,
    interestInUsers: String,
    interestByUsers: String,
    boxHoroscope:Object,
    boxHoroscopeSecond:Object,
    regNumber: String,
    regDate: { type: String, default: regDate },
    type: { type: String, default: "free" },
    status: { type: String, default: "0" },
    mobile: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { collection: "MatrimonialUsers" }
);

mongoose.model("MatrimonialUsers", MatrimonialSchema);
