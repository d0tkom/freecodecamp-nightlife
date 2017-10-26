var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var barSchema = new Schema({
    yelpId: { type: 'String', required: true },
    going: { type: 'Array', required: true },
    dateAdded: { type: 'Date', default: Date.now, required: true },
});

module.exports = mongoose.model('Bar', barSchema);
