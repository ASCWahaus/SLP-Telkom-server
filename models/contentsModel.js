import mongoose from "mongoose";
import joi from "joi";

const contentSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  name : String,
  creator : {
    type : String,
    ref : 'users'
  },

  // type : {
  //     type: String,
  //     required: true
  // },
  categories:
    {
      type: String,
      required: true,
    },
  url: String,
  thumbnail: String,
  video: String,
  likes: {
    type: [String],
    default: [],
  },

  // comments: {
  //   type: [String],
  //   default: [],
  // },
  comments: [{
    // type: String
    commentBy : {
      type : String,
      ref : 'users'
    },
    text : String,
    createdAt: {
      type: Date,
      default: new Date(),
    },
  }],
  createdAt: {
    type: Date,
    default: new Date(),
  },
});

var ContentsModel = mongoose.model("contents", contentSchema);

// const validator = (data) => {
//     const schema = joi.object({
//         title:joi.string().required(),
//         description:joi.string().required(),
//         type:joi.string().required(),
//         categories:joi.string().required(),
//     })
//     return schema.validate(data)
// }

export default ContentsModel; //exclud validator
