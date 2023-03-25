const { validationResult } = require("express-validator");
const HttpError = require("../models/http-error");
const User = require("../models/user");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const getAllUsers = async (req, res, next) => {
  let users;

  try {
    users = await User.find({}, "-password");
  } catch (err) {
    const error = new HttpError(
      "Fetching users went wrong, please try again later",
      500
    );
    return next(error);
  }

  res
    .status(200)
    .json({ users: users.map((user) => user.toObject({ getters: true })) });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  let identifiedUser;
  try {
    identifiedUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError("Something went wrong", 500);
    return next(error);
  }

  if (!identifiedUser) {
    return next(new HttpError("Could not login, wrong credentials", 403));
  }

  let isValidPassword;
  try {
    isValidPassword = await bcrypt.compare(password, identifiedUser.password);
  } catch (err) {
    const error = new HttpError("Something went wrong", 500);
    return next(error);
  }

  if (!isValidPassword) {
    return next(new HttpError("Could not login, wrong credentials", 403));
  }

  let token;
  try {
    token = jwt.sign(
      { userId: identifiedUser.id, email: identifiedUser.email },
      "somePrivateKeyIdk",
      { expiresIn: "1h" }
    );
  } catch (err) {
    const error = new HttpError(
      "Something went wrong with loggin this user",
      500
    );
    return next(error);
  }

  res
    .status(200)
    .json({
      userId: identifiedUser.id,
      email: identifiedUser.email,
      token: token,
    });
};

const signUp = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data", 422)
    );
  }
  const { name, email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError("Something went wrong", 500);
    return next(error);
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    const error = new HttpError(
      "Could not hash password please try again",
      500
    );
    return next(error);
  }

  const createdUser = new User({
    name,
    email,
    password: hashedPassword,
    image: req.file.path,
    places: [],
  });


  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError("Could not create user", 500);
    return next(error);
  }

  let token;
  try {
    token = jwt.sign(
      { userId: createdUser.id, email: createdUser.email },
      "somePrivateKeyIdk",
      { expiresIn: "1h" }
    );
  } catch (err) {
    const error = new HttpError(
      "Something went wrong with creating this user",
      500
    );
    return next(error);
  }

  res.status(201).json({ userId:createdUser.id,email:createdUser.email,token:token });
};

const logout = (req, res, next) => {
  res.json({ message: "logout" });
};

exports.login = login;
exports.logout = logout;
exports.signUp = signUp;
exports.getAllUsers = getAllUsers;
