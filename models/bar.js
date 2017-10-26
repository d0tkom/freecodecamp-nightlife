var mongoose = require('mongoose');
var Schema   = mongoose.Schema;
var cuid = require('cuid');

var barSchema = new Schema({
    yelpId: { type: 'String', required: true },
    going: { type: 'Array', required: true },
    cuid: { type: 'String', default: cuid(), required: true},
    dateAdded: { type: 'Date', default: Date.now, required: true },
});

module.exports = mongoose.model('Bar', barSchema);
