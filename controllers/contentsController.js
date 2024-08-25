import express from "express";
import mongoose from "mongoose";
import _ from "lodash"

import dotenv from "dotenv";
import cloudinary from "cloudinary";
dotenv.config({
  path: "./config/config.env",
});

const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } =
  process.env;

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

import ContentsModel from "../models/contentsModel.js"; //exclude {validator}
import UsersModel from "../models/usersModel.js";
// import validate from "../middleware/validate"
// import isValidObjectId from "../middleware/isValidObjectId"

//all contents

export const getContents = async (req, res) => {
  const { page } = req.query;
  try {
    const LIMIT = 12;
    const startIndex = (Number(page) - 1) * LIMIT;
    const total = await ContentsModel.countDocuments({});

    const contents = await ContentsModel.find()
      .populate('creator', 'name avatar')
      .populate('comments.commentBy', 'name avatar')
      .sort({ _id: -1 })
      .limit(LIMIT)
      .skip(startIndex);

    // console.log(contents)
    // res.status(200).json({ data: contents, currentPage: Number(page), NumberOfPages: Math.ceil(total / LIMIT)});
    res.json({
      data: contents,
      currentPage: Number(page),
      numberOfPages: Math.ceil(total / LIMIT),
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// 1 content
export const getContent = async (req, res) => {
  const { id } = req.params;

  try {
    const post = await ContentsModel.findById(id)
    .populate('creator', 'name avatar')
    .populate('comments.commentBy', 'name avatar')


    post.comments = _.map(_.sortBy(post.comments, 'createdAt').reverse());
    let json = post.toObject();
    let comments = [];
    for(const data of post.comments){
      const {avatar} = await UsersModel.findById(data.commentBy).select('avatar')
      // console.log(data)
      comments.push({
        avatar: avatar,
        _id : data._id,
        commentBy : data.commentBy,
        commentName : data.commentName,
        text : data.text,
        createdAt: data.createdAt
      })
    }
    json.comments = comments
    res.status(200).json(json);

    // res.status(200).json(post);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getByCategory = async (req, res) => {
  const { categories } = req.query;
  console.log(`categories`, categories);

  try {
    const newCategory = new RegExp(categories, "i");
    const content = await ContentsModel.find({
      $or: [{ categories: newCategory }],
    })
    .populate('creator', 'name avatar')

    res.status(200).json(content);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getByName = async (req, res) => {
  try {

    const content = await ContentsModel.find({
      $or: [{ creator: req.user }]
    })
    .populate('creator', 'name avatar')
    .sort({ _id: -1 })

    
    res.status(200).json(content);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

//add content
// export const createContent = async (req, res) => {
//     const post = req.body;

//     const newPost = new ContentsModel({...post, createdAt: new Date().toISOString()})

//     try {
//         await newPost.save();

//         res.status(201).json(newPost)

//     } catch (error) {
//         res.status(409).json({message : error.message})
//     }
// }

//add content
export const createContent = async (req, res) => {
  try {
    let uploadThunbnail;
    let uploadVideo;
    const thumbnail = req.files["thumbnail"][0];
    if(thumbnail){
      uploadThunbnail = await cloudinary.v2.uploader.upload(
          thumbnail.path,
          { resource_type: "image" }
      );
    }

    const video = req.files["video"][0];
    if(video){
      uploadVideo = await cloudinary.v2.uploader.upload(video.path, {
        resource_type: "video",
      });
    }

    const body = {
      ...req.body,
    };
    delete body.thumbnail;
    delete body.video;

    const newPost = new ContentsModel({
      ...body,
      createdAt: new Date().toISOString(),
      creator: req.user,
      thumbnail: uploadThunbnail.secure_url,
      video: uploadVideo.secure_url,
    });

    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    res.status(409).json({
      message: error.message,
    });
  }
};

export const createContentV2 = async (req, res) => {
  try {
    const { user, body } = req;

    // body.user_id = user;
    //body.creator = user;

    const newPost = new ContentsModel({
      ...body,
      createdAt: new Date().toISOString(),
      creator: req.user,
    })
    await newPost.save();
    res.status(201).json(newPost);
  } catch (e) {
    res.status(409).json({
      message: e.message
    })
  }
}

export const uploadThumbnail = async (req, res) => {
  try {
    const thumbnail = req.files["thumbnail"][0];
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

export const uploadVideo = async (req, res) => {
  try {
    const video = req.files["video"][0];
    const videoUrl = await cloudinary.v2.uploader.upload(
        video.path,
        { resource_type: "video" }
    );
    res.status(201).json({url: videoUrl.secure_url})
  }catch (e) {
    res.status(409).json({
      message: e.message
    })
  }
}

//update content
export const updateContent = async (req, res) => {
  const { id: _id } = req.params;
  const post = req.body;

  if (!mongoose.Types.ObjectId.isValid(_id))
    return res.status(404).send("No content with that id");

  const updateContent = await ContentsModel.findByIdAndUpdate(
    _id,
    { ...post, _id },
    { new: true }
  );

  res.json(updateContent);
};

//delete content
export const deleteContent = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(404).send("No content with that id");

  await ContentsModel.findByIdAndRemove(id);

  // console.log("DELETE")

  res.json({ message: "Content deleted successfully" });
};

//like content
export const likeContent = async (req, res) => {
  const { id } = req.params;

  if (!req.user) return res.json({ message: "Unauthenticated" });

  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(404).send("No content with that id");

  const post = await ContentsModel.findById(id);

  const index = post.likes.findIndex((id) => id === String(req.user));
  if (index === -1) {
    post.likes.push(req.user);
  } else {
    post.likes = post.likes.filter((id) => id !== String(req.user));
  }

  const updatedPost = await ContentsModel.findByIdAndUpdate(id, post, {
    new: true,
  }).populate('creator', 'name avatar')

  res.json(updatedPost);
};

//search content
export const getContentsBySearch = async (req, res) => {
  // note :
  // QUERY -> /contents?page=1 -> page = 1   <- search
  // PARAMS -> /contents/123 -> id = 123     <- get spesific data

  const { searchQuery, categories } = req.query;

  try {
    const title = new RegExp(searchQuery, "i"); // ignore case LIKE,Like -> like

    const contents = await ContentsModel.find({
      $or: [
        { title },
        // { categories} // : { $in: categories.split(',') }
      ],
    }).populate('creator', 'name avatar');

    res.json({ data: contents });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

//comment content
// export const commentPost = async (req, res) => {

//     const {id} = req.params;
//     const {value} = req.body;

//     const post = await ContentsModel.findById(id);

//     post.comments.push(value);

//     const updatedPost = await ContentsModel.findByIdAndUpdate(id, post, {new: true});

//     res.json(updatedPost)
// }

//comment content (experiment)
export const commentPost = async (req, res) => {
    const {id} = req.params;

  const value = {
    commentBy: req.user,
    text: req.body.data.text,
    createdAt : new Date().toISOString()
  };


  console.log("value", req);

  const post = await ContentsModel.findById(id);


  post.comments.push(value);

  const updatedPost = await ContentsModel.findByIdAndUpdate(id, post, {
    new: true,
  });

  res.json(updatedPost);
};

// export const commentPost = async (req, res) => {
//   const {id} = req.params;
//   const {value} = req.body;

//   const post = await ContentsModel.findById(id);

//   post.comments.push(value);

//   const updatedPost = await ContentsModel.findByIdAndUpdate(id, post, {new: true});

//   res.json(updatedPost)

// }
