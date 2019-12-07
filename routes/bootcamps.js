const express = require('express');
const {getBootcamps, getBootcamp, createBootcamp, updateBootcamp, deleteBootcamp, getBootcampsInRadius, bootcampPhotoUpload} = require('../conrollers/bootcamps');
const advancedResults = require('../middleware/advancedResults');
const Bootcamp = require('../models/Bootcamp');
const router = express.Router();
// Include other resource routes
const courseRouter = require('./courses');

// Re-route into other resource routers
router.use('/:bootcampId/courses', courseRouter);
router.route('/radius/:zipcode/:distance').get(getBootcampsInRadius);
router.route('/:id/photo').put(bootcampPhotoUpload);
router.route('/')
    .get(advancedResults(Bootcamp, 'courses'), getBootcamps)
    .post(createBootcamp);
router.route('/:id')
    .get(getBootcamp)
    .put(updateBootcamp)
    .delete(deleteBootcamp);

module.exports = router;