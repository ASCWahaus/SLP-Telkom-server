import express from "express";
import {
  commentPost,
  getContentsBySearch,
  getContents,
  getContent,
  createContent,
  updateContent,
  deleteContent,
  likeContent,
  getByCategory,
  getByName,
  createContentV2,
    uploadThumbnail,
    uploadVideo
} from "../controllers/contentsController.js";

import validate from '../middleware/validate.js';
import { protect, auth, isNotVerified } from "../middleware/auth.js";
import multer from "multer";
import { createContents } from "../validation/contents/contents.schema.js";

const router = express.Router();

const imageStorage = multer({
  storage: multer.diskStorage({
    filename: function (req, file, callback) {
      if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype ==='image/gif'){
        callback(null, Date.now() + file.originalname);
      } else {
        callback({message: "Please upload jpeg or png format"}, false);
      }
    },
  }),
});

const videoStorage = multer({
  storage: multer.diskStorage({
    filename: function (req, file, callback) {
      if(file.mimetype === 'video/mp4' || file.mimetype === 'video/mkv'){
        callback(null, Date.now() + file.originalname);} 
        else {
        callback({message: "Please upload mp4 format"}, false);    
        }
      },
  }),
});

//get by name
router.get("/mycontent", auth, getByName);

//getByCategory
router.get("/categories", auth, getByCategory);
//search
router.get("/search", getContentsBySearch);
//semua konten
router.get("/", auth, getContents);
//add konten
// router.post('/', createContent) //exclude validate(validator)
//add konten
const createContentMulter = imageStorage.fields([{ name: 'thumbnail', maxCount: 1 }, { name: 'video', maxCount: 1 }])
router.post('/', auth, createContentMulter, createContent) //exclude validate(validator)

//create content
router.post('/create', auth, await validate(createContents),  createContentV2)
// router.post('/create', auth,  createContentV2)

//uploadThumbnail
const uploadThumbnailMulter = imageStorage.fields([{name: 'thumbnail', maxCount: 1}])
router.post('/uploadThumbnail', auth, uploadThumbnailMulter, uploadThumbnail)
//uploadVideo
const uploadVideoMulter = videoStorage.fields([{name: 'video', maxCount: 1}])
router.post('/uploadVideo', auth, uploadVideoMulter, uploadVideo)

// get 1 konten
router.get("/:id", auth, getContent);
//update konten
router.patch("/:id", auth, updateContent);
//delete konten
router.delete("/:id", auth, deleteContent);
//like
router.patch("/:id/likeContent", auth, likeContent);
//comment
router.post("/:id/commentPost", auth, commentPost);

export default router;
