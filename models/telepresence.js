const mongoose = require('mongoose');
const User = require('./user');
const Robot = require('./robot');
const Schema = mongoose.Schema;

const telepresenceSchema = new Schema({
    robot: {
      type: Schema.Types.ObjectId,
      ref: 'Robot'
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    who: String,
    email: String,
    whom: String,
    where: String,
    duration: Number,
    when: Date,
    zoom: String,
    start: String,
    join: String,
});

module.exports = mongoose.model('Telepresence', telepresenceSchema);
