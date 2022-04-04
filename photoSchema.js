const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const arrivals=require('./arrivals')
const photoSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    profileImg: {
        type: String
    },
    register_id:{
       type:mongoose.Schema.Types.ObjectId,
       ref:arrivals,
       required:true,
       index:true,
   }

}, {
    collection: 'photos'
})
module.exports = mongoose.model('Photos', photoSchema)