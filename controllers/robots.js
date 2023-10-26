const Robot = require('../models/robot');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const { cloudinary } = require("../cloudinary");

module.exports.index = async (req, res) => {
    const robots = await Robot.find({}).populate('popupText');
    res.render('robots/index', { robots })
}

module.exports.renderNewForm = (req, res) => {
    res.render('robots/new');
}

module.exports.createRobot = async (req, res, next) => {
    const robot = new Robot(req.body.robot);
    if (req.body.robot.location.startsWith("@")) {
     const parse = req.body.robot.location.substring(1).split(",");
     robot.geometry = { coordinates : [parse[1], parse[0]], type: "Point" };
    } else { const geoData = await geocoder.forwardGeocode({
        query: req.body.robot.location,
        limit: 1
     }).send();
     robot.geometry = geoData.body.features[0].geometry;
    }
    robot.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    robot.author = req.user._id;
    await robot.save();
    console.log(robot);
    req.flash('success', 'Successfully made a new robot!');
    res.redirect(`/robots/${robot._id}`)
}

module.exports.showRobot = async (req, res,) => {
    const robot = await Robot.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!robot) {
        req.flash('error', 'Cannot find that robot!');
        return res.redirect('/robots');
    }
    res.render('robots/show', { robot });
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const robot = await Robot.findById(id)
    if (!robot) {
        req.flash('error', 'Cannot find that robot!');
        return res.redirect('/robots');
    }
    res.render('robots/edit', { robot });
}

module.exports.updateRobot = async (req, res) => {
    const { id } = req.params;
    const robot = await Robot.findByIdAndUpdate(id, { ...req.body.robot });
    if (req.body.robot.location.startsWith("@")) {
     const parse = req.body.robot.location.substring(1).split(",");
     robot.geometry = { coordinates : [parse[1], parse[0]], type: "Point" };
    } else { const geoData = await geocoder.forwardGeocode({
        query: req.body.robot.location,
        limit: 1
     }).send();
     robot.geometry = geoData.body.features[0].geometry;
    }
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    robot.images.push(...imgs);
    await robot.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await robot.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'Successfully updated robot!');
    res.redirect(`/robots/${robot._id}`)
}

module.exports.deleteRobot = async (req, res) => {
    const { id } = req.params;
    await Robot.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted robot')
    res.redirect('/robots');
}
