const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const successSchema = new Schema({
    register_number: { type: String, required: true },
    register_number2: { type: String, required: true },
    name: { type: String, required: true },
    name2: { type: String, required: true },
    profileImg: { type: String, required: true }
});

module.exports = mongoose.model("success", successSchema)