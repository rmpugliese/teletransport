const mongoose = require('mongoose');
const User = require('./user');
const Mission = require('./mission');
const Robot = require('./robot');
const Schema = mongoose.Schema;

const eventSchema = new Schema({
    robot: {
      type: Schema.Types.ObjectId,
      ref: 'Robot'
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    mission: {
        type: Schema.Types.ObjectId,
        ref: 'Mission'
    },
    goal: String,
    action: String,
    parameters: String,
    distance: Number,
    result: Number,
    start: Date,
    end: Date,
});

module.exports = mongoose.model('Event', eventSchema);
