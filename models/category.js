const mongoose = require('mongoose');

const categoryChema = new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    slug:{
        type:String
    }
});
module.exports = mongoose.model('category',categoryChema);