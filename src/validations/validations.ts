import Joi, { ObjectSchema } from 'joi';
const authSignup = Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
});

const authLogin = Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

const blogValidations = Joi.object().keys({
    title: Joi.string().required(),
    snippet: Joi.string().required(),
    category: Joi.string().required(),
    imageUrl: Joi.string().required(),
    author: Joi.string().required(),
    body: Joi.string().required()
});

const messageValidations = Joi.object().keys({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    message: Joi.string().required()
});


export default {
    "/login": authLogin,
    "/signup": authSignup,
    "/blog/createnew": blogValidations,
    "/contactme": messageValidations
} as { [key: string]: ObjectSchema };
  