import  express  from "express"
import  mongoose  from "mongoose"
import dotenv from "dotenv"
import cloudinary from "cloudinary"
import usersModel from "../models/usersModel.js"
import ContentsModel from "../models/contentsModel.js"

const {
    CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET,
} = process.env;

cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET
});

 // 1 content
 export const getMyContent = async (req, res) => { 
     console.log(req.user)
     try {
        
    const post = await ContentsModel.find({creator: req.user})
    res.status(200).json(post);
} catch (error) {
    console.log(error)
     res.status(404).json({ message: error.message });
}
}
  

//get content profile
export const getProfile = async (req, res) => { 
    const {id} = req.params;

    try {
        const post = await usersModel.findById(id);
        
        res.status(200).json(post);
    } catch (error) {
        console.log(error)
        // res.status(404).json({ message: error.message });
    }
}

//update content
export const updateMyProfile = async (req, res) => {
    const {id: _id} = req.params
    const post = req.body

    if(!mongoose.Types.ObjectId.isValid(_id)) return res.status(404).send("No content with that id")

    const updateContent = await usersModel.findByIdAndUpdate(_id, {...post, _id}, {new: true})

    res.json(updateContent)

}

//upload Profile Picture
export const uploadProfilePicture = async (req, res) => {
    try {
      const thumbnail = req.files["avatar"][0];
      const thumbnailUrl = await cloudinary.v2.uploader.upload(
          thumbnail.path,
  { resource_type: "image" }
      );
      res.status(201).json({url: thumbnailUrl.secure_url})
    }catch (e) {
      res.status(409).json({
        message: e.message
      })
    }
  }