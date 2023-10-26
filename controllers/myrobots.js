const Robot = require('../models/robot');
const User = require('../models/user');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const { cloudinary } = require("../cloudinary");


module.exports.index = async (req, res) => {
    const user = await User.findOne({username: req.session.passport.user});
    // console.log(user._id);
    const robots = await Robot.find({author: user._id}).populate('popupText');
    res.render('robots/myindex', { robots })
}

