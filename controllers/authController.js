import UsersModel from "../models/usersModel.js";
import ErrorResponse from "../utils/errorResponse.js";
import { sendEmail, templateEmail } from "../utils/sendEmail.js";
import crypto from "crypto";
import bcrypt from "bcryptjs"; //untuk login2/register2
import jwt from "jsonwebtoken"; //untuk login2/register2

export const register = async (req, res, next) => {
  const { name, email, password, emailToken, isVerified } = req.body;

  try {
    const oldUser = await UsersModel.findOne({ email });

    if (oldUser) return res.status(400).json({ message: "User already exists" });

    const user = await UsersModel.create({
      name,
      email,
      password,
      emailToken: crypto.randomBytes(20).toString("hex"),
      isVerified: false,
    });

    const verifyUrl = `http://localhost:3000/verify?token=${user.emailToken}`;

    const message = `
        <h1>Welcome to Social Learning Platform</h1>
        <p>Thanks for registering on our site, please click link below to verify your account.</p>
        <a href=${verifyUrl} clicktracking=off>Verify account</a>
        <p> or copy this link</p>
        <p>${verifyUrl}</p>

        `;

    try {
      await sendEmail({
        to: user.email,
        subject: "Verify your account",
        text: message,
      });

      res.status(200).json({ success: true, data: "Email Sent" });
    } catch (error) {
      return next(new ErrorResponse("Email could not be send", 500));
    }

    // res.status(200).json({success:true, user})

    // sendToken(user, 200, res);
  } catch (error) {
    next(error);
  }

  ////////cara 1
  // const formUser = req.body;

  // const newUser = new UsersModel(formUser)

  // try {

  //     await newUser.save();

  //     sendToken(newUser, 201, res)

  // } catch (error) {
  //     next(error)
  // }
};

export const register2 = async (req, res, next) => {
  const { name, email, password, position, company, biography, emailToken, isVerified } = req.body;

  try {
    const existingUser = await UsersModel.findOne({ email });

    if (existingUser) return res.status(400).json({ message: "User already exists" });

    // const hashedPassword = await bcrypt.hash(password, 12);

    const user = await UsersModel.create({
      name,
      email,
      password,
      position,
      company,
      biography,
      emailToken: crypto.randomBytes(20).toString("hex"),
      isVerified: false,
      createdAt: new Date().toISOString(), //new input
    }); //: hashedPassword

    // const token = jwt.sign({email:result.email, id: result._id}, process.env.JWT_SECRET_KEY, {expiresIn:"1h"})
    const verifyUrl = `http://localhost:3000/success?token=${user.emailToken}`;

    const message = `
    <h1>Welcome to Social Learning Platform</h1>
    <p>Thanks for registering on our site, please click link below to verify your account.</p>
    <a href=${verifyUrl} clicktracking=off>Verify account</a>
    <p> or copy this link</p>
    <p>${verifyUrl}</p>

    `;

    try {
      await sendEmail({
        to: user.email,
        subject: "Verify your account",
        text: message,
      });

      res.status(200).json({ success: true, data: "Email Sent" });
    } catch (error) {
      return next(new ErrorResponse("Email could not be send", 500));
    }

    // res.status(201).json({ result, token });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });

    console.log(error);
  }
};

//experiment dont use yet!!
export const register3 = async (req, res, next) => {
  const { name, email, password, position, company, biography, emailToken, isVerified } = req.body;

  try {
    const existingUser = await UsersModel.findOne({ email });

    if (existingUser) return res.status(400).json({ message: "User already exists" });

    // const hashedPassword = await bcrypt.hash(password, 12);

    const user = await UsersModel.create({
      name,
      email,
      password,
      position,
      company,
      biography,
      emailToken: crypto.randomBytes(20).toString("hex"),
      isVerified: false,
      createdAt: new Date().toISOString(), //new input
    }); //: hashedPassword

    // const token = jwt.sign({email:result.email, id: result._id}, process.env.JWT_SECRET_KEY, {expiresIn:"1h"})
    const verifyUrl = `${process.env.HOST_NAME}/success?token=${user.emailToken}`;

    try {

      const template = templateEmail("template",{verifyUrl, var2:"var 2 testing"});

      await sendEmail({
        to: user.email,
        subject: "Verify your account",
        text: template.text,
        html: template.html
      });

      res.status(200).json({ success: true, data: "Email Sent" });
    } catch (error) {
      return next(new ErrorResponse("Email could not be send", 500));
    }

    // res.status(201).json({ result, token });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });

    console.log(error);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const user = await UsersModel.findOne({ emailToken: req.query.token });
    if (!user) {
      res.status(404).json({ message: "Token invalid" });
    }
    user.emailToken = undefined;
    user.isVerified = true;
    await user.save();

    res.status(200).json({ success: true, message: "Account has been Verified" });

    // res.redirect("/login")
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorResponse("Please provide an email and password", 400));
  }

  try {
    const user = await UsersModel.findOne({ email }).select("+password");

    if (!user) {
      return next(new ErrorResponse("Invalid credentials", 401));
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return next(new ErrorResponse("Invalid credentials", 404));
    }

    sendToken(user, 201, res);
  } catch (error) {
    res.status(500).json({ succes: false, error: error.message });
  }
};

export const login2 = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const existingUser = await UsersModel.findOne({ email }).select("+password");

    if (!existingUser) return res.status(404).json({ message: "User doesn't exist" });

    const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);

    if (!isPasswordCorrect) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ email: existingUser.email, _id: existingUser._id }, process.env.JWT_SECRET_KEY, { expiresIn: "1h" });

    res.status(200).json({ _id: existingUser._id, email: existingUser.email, name: existingUser.name, isVerified: existingUser.isVerified, token });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
    console.log(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  try {
    const user = await UsersModel.findOne({ email });

    if (!user) {
      return next(new ErrorResponse("Email could not be sent", 404));
    }

    const resetToken = user.getResetPasswordToken();

    await user.save();

    const resetUrl = `http:localhost:3000/resetpassword/${resetToken}`;

    const message = `
        <h1>You have requested a password reset</h1>
        <p>Please go to this link to reset your password</p>
        <a href=${resetUrl} clicktracking=off>Click here</a>
        <p> or copy this link</p>
        <p>${resetUrl}</p>

        `;

    try {
      await sendEmail({
        to: user.email,
        subject: "Password Reset Request",
        text: message,
      });

      res.status(200).json({ success: true, data: "Email Sent" });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save();

      return next(new ErrorResponse("Email could not be send", 500));
    }
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  const resetPasswordToken = crypto.createHash("sha256").update(req.params.resetToken).digest("hex");

  try {
    const user = await UsersModel.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return next(new ErrorResponse("Invalid Reset Token", 400));
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(201).json({
      succes: true,
      data: "Reset Password Success",
    });
  } catch (error) {
    next(error);
  }
};

const sendToken = (user, statusCode, res) => {
  const token = user.getSignedToken();
  res.status(statusCode).json({ success: true, token });
};
