import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import joi from "joi";
import crypto from 'crypto'

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required : [true, "Please provide a name"]
    },
    email : {
        type : String,
        required: [true, "Please provide a email"],
        match: [
            /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            "Please provide a valid email"
        ]
    },
    password : {
        type : String,
        required: [true, "Please input a password"],
        min : 6,
        select : false 
    },
    position : String,
    company : String,
    biography : String,
    avatar : String,
    skills : [
        {
            type : String
        }
    ],
    resetPasswordToken : String,
    resetPasswordExpire : Date,
    emailToken : String,
    isVerified : Boolean,
    id : String, //tambahan untuk login2/register2
    createdAt: {
        type: Date,
        default: new Date()
      },
})

//hashing password
userSchema.pre("save", async function(next) {
    if(!this.isModified("password")){
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt)
    next();
})

//check password
userSchema.methods.matchPassword = async function(password) {
    return await bcrypt.compare(password, this.password)
}

//generate token
userSchema.methods.getSignedToken = function() {
    return jwt.sign({id: this._id}, process.env.JWT_SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRE
    })

    // return jwt.sign({email:existingUser.email, id: existingUser._id}, process.env.JWT_SECRET_KEY, {expiresIn:"1h"})
}

//reset token
userSchema.methods.getResetPasswordToken = function() {
    const resetToken = crypto.randomBytes(20).toString("hex")

    this.resetPasswordToken = crypto.createHash("sha256")
    .update(resetToken)
    .digest("hex")

    this.resetPasswordExpire = Date.now() + 10 * (60 * 1000)

    return resetToken;
}

var UsersModel = mongoose.model("users", userSchema);

export default UsersModel;