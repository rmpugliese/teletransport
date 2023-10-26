const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const missionSchema = new Schema({
  name: String,
  tasks: String,
});

module.exports = mongoose.model("Mission", missionSchema);
