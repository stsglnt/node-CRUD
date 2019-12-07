const path = require('path');
const ErrorResponse = require('../utils/errorResponse')
const geocoder = require('../utils/geocoder');
const Bootcamp = require('../models/Bootcamp');
const asyncHandler = require('../middleware/async');
// @desc    Get all bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
        res.status(200).json(res.advancedResults);
});
// @desc    Get singe bootcamp
// @route   GET /api/v1/bootcamps/:id
// @access  Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
        const bootcamp = await Bootcamp.findById(req.params.id);
        if (!bootcamp) {
            return  next(new ErrorResponse(`Bootcamp with ${req.params.id} not found`, 404))

        } else {
            res.status(200).json({
                success: true,
                data: bootcamp
            });
        }
        res.status(200).json({success: true, msg: 'Create new bootcamp'})
});
// @desc    Create new bootcamp
// @route   POST /api/v1/bootcamps
// @access  Public
exports.createBootcamp =  asyncHandler(async (req, res, next) => {
        const bootcamp = await Bootcamp.create(req.body);
        res.status(201).json({
            success: true,
            data: bootcamp
        })
});
// @desc    Update bootcamp
// @route   PUT /api/v1/bootcamps/:id
// @access  Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
        const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!bootcamp) {
            return  next(new ErrorResponse(`Bootcamp with ${req.params.id} not found`, 404))
        } else {
            res.status(200).json({
                success: true,
                data: bootcamp
            })
        }
});
// @desc    Delete bootcamp
// @route   DELETE /api/v1/bootcamps/:id
// @access  Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
        const bootcamp = await Bootcamp.findById(req.params.id);
        if (!bootcamp) {
            return  next(new ErrorResponse(`Bootcamp with ${req.params.id} not found`, 404))
        } else {
            res.status(200).json({
                success: true,
                data: {}
            })
        }
        bootcamp.remove();
});
// @desc    Get bootcamps within a radius
// @route   GET /api/v1/bootcamps/radius/:zipcode/:distance
// @access  Private
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
    const { zipcode, distance } = req.params;

    // Get lat/lng from geocoder
    const loc = await geocoder.geocode(zipcode);
    const lat = loc[0].latitude;
    const lng = loc[0].longitude;

    // Calc radius using radians
    // Divide distance by radius of Earth
    // Earth Radius = 3,963 mi / 6,378 km
    const radius = distance / 3963;
    const bootcamps = await Bootcamp.find({
        location: { $geoWithin: { $centerSphere: [ [ lng, lat ], radius ] }}
    });
    res.status(200).json({
        success: true,
        count: bootcamps.length,
        data: bootcamps
    })
});

// @desc    Upload pgoto for bootcamp
// @route   PUT /api/v1/bootcamps/:id/photo
// @access  Private
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);
    if (!bootcamp) {
        return  next(new ErrorResponse(`Bootcamp with ${req.params.id} not found`, 404))
    }
    if(!req.files) {
        return  next(new ErrorResponse(`Please upload a file`, 404))
    }
    const file = req.files.file;

    if(!file.mimetype.startsWith('image')) {
        return  next(new ErrorResponse(`Please upload an image file`, 404))
    }
    // Check filesize
    if(file.size > process.env.MAX_FILE_UPLOAD) {
        return  next(new ErrorResponse(`Please upload an image less then ${process.env.MAX_FILE_UPLOAD}`, 404))
    }

    // Create custom filename
    file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;
    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async  err => {
        if (err) {
         return  next(new ErrorResponse(`Problem with fileupload`, 500));
        }
        await Bootcamp.findByIdAndUpdate(req.params.id, {photo: file.name});
        res.status(200).json({
            success: true,
            data: file.name
        })
    })
});