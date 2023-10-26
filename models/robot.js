const mongoose = require('mongoose');
const Review = require('./review');
const Mission = require('./mission');
const Schedule = require('./schedule');
const Schema = mongoose.Schema;


// https://res.cloudinary.com/douqbebwk/image/upload/w_300/v1600113904/YelpCamp/gxgle1ovzd2f3dgcpass.png

const ImageSchema = new Schema({
    url: String,
    filename: String
});

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
});

const opts = { toJSON: { virtuals: true } };


const RobotSchema = new Schema({
    title: String,
    images: [ImageSchema],
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    connecturl: String,
    connectremoteurl: String,
    model: String,
    serial: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    allowedusers: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ],
    currentmap: String,
    missions: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Mission'
      }
    ],
    schedules: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Schedule'
      }
    ],
    telepresences: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Telepresence'
      }
    ],
    destinations: [String],
}, opts);


RobotSchema.virtual('properties.popUpMarkup').get(function () {
    return `
    <strong><a href="/robots/${this._id}">${this.title}</a><strong>
    <p>${this.description.substring(0, 20)}...</p>`
});



RobotSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        });
        await Mission.deleteMany({
            _id: {
                $in: doc.missions
            }
        });
        await Schedule.deleteMany({
            _id: {
                $in: doc.schedules
            }
        });
        await Telepresence.deleteMany({
            _id: {
                $in: doc.telepresences
            }
        });
    }
})

module.exports = mongoose.model('Robot', RobotSchema);
