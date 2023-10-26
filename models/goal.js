const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const goalSchema = new Schema({
  name: String,
  x: Number,
  y: Number,
  z: Number,
  type: Number,
});

module.exports = mongoose.model("Goal", goalSchema);
