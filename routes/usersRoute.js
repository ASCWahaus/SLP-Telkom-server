import multer from "multer"
import express from "express"

import {
  protect,
  auth,
  isNotVerified
} from '../middleware/auth.js'
import {
  getMyContent,
  getProfile,
  updateMyProfile,
  uploadProfilePicture
} from "../controllers/usersController.js"

const imageStorage = multer({
  storage: multer.diskStorage({
    filename: function (req, file, callback) {
      if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
        callback(null, Date.now() + file.originalname);
      } else {
        callback({message: "Please upload jpeg or png format"}, false);
      }
    },
  }),
});

const router = express.Router()
//ambil content berdasarkan creator
router.get('/profile', auth, getMyContent)
//ambil data profile
router.get('/:id', auth, getProfile)  
//update data profile
router.put('/:id', auth, updateMyProfile)   
//upload profile Picture
const uploadThumbnailMulter = imageStorage.fields([{name: 'avatar', maxCount: 1}])
router.post('/uploadProfilePicture', auth, uploadThumbnailMulter, uploadProfilePicture)

export default router 