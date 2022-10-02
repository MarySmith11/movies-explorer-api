const { celebrate, Joi } = require('celebrate');
const userRouter = require('express').Router();
const {
  updateProfile, getProfile, logout,
} = require('../controllers/users');

userRouter.post('/signout', logout);
userRouter.get('/users/me', getProfile);
userRouter.patch('/users/me', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    name: Joi.string().required().min(2).max(30),
  }),
}), updateProfile);
module.exports = userRouter;
