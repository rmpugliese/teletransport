const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const vwallSchema = new Schema({
 name: String,
 polygon: [Number],
});

module.exports = mongoose.model("VWall", vwallSchema);
