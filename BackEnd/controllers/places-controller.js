const fs = require('fs');

const HttpError = require("../models/http-error");
const { validationResult } = require("express-validator");
const getCoordsForAddress = require("../util/location");
const Place = require("../models/place");
const User = require("../models/user");
const mongoose  = require("mongoose");



const getPlaceById = async (req, res, next) => {
  const placeId = req.params.placeId;

  let place;

  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError("Could not find this place", 500);
    next(error);
  }

  if (place) {
    res.json({ place: place.toObject({ getters: true }) });
  } else {
    const error = new HttpError(
      "Could not find a place for the provided id",
      404
    );
    next(error);
  }
};

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.userId;

  let userWithPlaces;

  try {
    userWithPlaces = await User.findById(userId).populate('places');
  } catch (err) {
    const error = new HttpError("Could not find places", 500);
    next(error);
  }

  if (!userWithPlaces || userWithPlaces.places.length === 0) {
    next(new HttpError("Could not find places for the provided userID", 404));
  }

  res.json({
    places: userWithPlaces.places.map((place) => place.toObject({ getters: true })),
  });
};

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data", 422)
    );
  }
  const { title, description, address } = req.body;

  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address);
  } catch (error) {
    return next(error);
  }

  const createdPlace = new Place({
    title,
    description,
    address,
    location: coordinates,
    image:req.file.path,
    creator:req.userData.userId,
  });

  let user;

  try {
    user = await User.findById(req.userData.userId);
  } catch (err) {
    const error = new Http("Creating place failed, please try again",500);
    return next(error);
  }

  if (!user){
    const error = new HttpError("Could not find user for provided id",404);
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdPlace.save({session:sess});
    user.places.push(createdPlace);
    await user.save({session:sess});
    await sess.commitTransaction();

  } catch (error) {
    const err = new HttpError(
      "Could not store this place, please try again",
      500
    );
    return next(err);
  }

  res.status(201).json({ place: createdPlace });
};

const updatePlace = async(req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid inputs passed, please check your data", 422));
  }

  const { title, description } = req.body;
  const placeId = req.params.placeId;

  let place;
  try{
    place = await Place.findById(placeId);
  }catch(err){
    const error = new HttpError("Something went wrong",500);
    return next(error);
  }
  
  if (place.creator.toString() !== req.userData.userId){
    const error = new HttpError("You are not authorized to edit this place",401);
    return next(error);
  }

  place.title = title;
  place.description = description;


  try{
    await place.save();
  }catch(err){
    const error = new HttpError(
      "Could not update",500
    )
    return next(error);
  }


  res.status(200).json({ place: place.toObject({getters:true}) });
};

const deletePlace = async(req, res, next) => {
  const placeId = req.params.placeId;

  let place;
  try {
    place = await Place.findById(placeId).populate('creator');
  } catch (err) {
    const error = new HttpError("Could not find that place",500);
    return next(error);
  }

  if (!place){
    const error = new HttpError("Could not find place for this id",404);
    return next(error);
  }

  if (place.creator.id !== req.userData.userId){
    const error = new HttpError("You are not authorized to delete this place",401);
    return next(error);
  }

  const imgPath = place.image;

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await place.remove({session:sess});
    place.creator.places.pull(place);
    await place.creator.save({session:sess});
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError("Could not delete that place",500);
    return next(error);
  }

  fs.unlink(imgPath,err=>{console.log(err)});

  res.status(200).json({ message: "Place deleted" });
};

exports.createPlace = createPlace;
exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
