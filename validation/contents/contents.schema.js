// const Joi = require('joi');
import Joi from "joi";

export const createContents = {
  body: Joi.object({
    title: Joi.string().min(8).max(75).required(),
    description: Joi.string().max(2500).required(),
    isPrivate: Joi.boolean().required().default(false),
    url: Joi.string().optional().allow(null).allow('').empty(''),
    categories: Joi.required(),
    thumbnail: Joi.string().optional().allow(null).allow('').empty(''),
    video: Joi.string().optional().allow(null).allow('').empty(''),
  }),
};

// module.exports = schema;
