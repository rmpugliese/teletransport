const mongoose = require('mongoose');
const User = require('./user');
const Mission = require('./mission');
const Robot = require('./robot');
const Schema = mongoose.Schema;

const scheduleSchema = new Schema({
    robot: {
      type: Schema.Types.ObjectId,
      ref: 'Robot'
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    mission: String,
    parameters: String,
    at: Date,
    repeat: Number,
});

module.exports = mongoose.model('Schedule', scheduleSchema);
