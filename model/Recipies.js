var mongoose = require('mongoose');

// Class Schema
var recipiesSchema = mongoose.Schema({
    name: {
        type: String
    },
    ingredients: {
        type: String
    },
    directions:{
        type:String
    }
});

module.exports = mongoose.model('recipies', recipiesSchema);

