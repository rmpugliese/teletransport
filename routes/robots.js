const express = require('express');
const router = express.Router();
const robots = require('../controllers/robots');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAuthor, validateRobot } = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

const Robot = require('../models/robot');

router.route('/')
    .get(catchAsync(robots.index))
    .post(isLoggedIn, upload.array('image'), validateRobot, catchAsync(robots.createRobot))


router.get('/new', isLoggedIn, robots.renderNewForm)

router.route('/:id')
    .get(catchAsync(robots.showRobot))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateRobot, catchAsync(robots.updateRobot))
    .delete(isLoggedIn, isAuthor, catchAsync(robots.deleteRobot));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(robots.renderEditForm))



module.exports = router;
