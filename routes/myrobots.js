const express = require('express');
const router = express.Router();
const myrobots = require('../controllers/myrobots');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAuthor, validateRobot } = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

const Robot = require('../models/robot');

router.route('/')
    .get(catchAsync(myrobots.index))

module.exports = router;
