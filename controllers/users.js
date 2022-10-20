const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
require('dotenv').config();

// ошибки
const BadRequestError = require('../errors/bad-request-err'); // 400
const UnauthorizedError = require('../errors/unauthorized-err'); // 401
const NotFoundError = require('../errors/not-found-err'); // 404
const ConflictError = require('../errors/conflict-err'); // 409
const InternalServerError = require('../errors/internal-server-err'); // 500

const { JWT_SECRET = '111111111' } = process.env;

module.exports.createUser = (req, res, next) => {
  const {
    name,
    password,
    email,
  } = req.body;
  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      email,
      password: hash,
      name,
    }))
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, { expiresIn: '7d' });
      res.cookie('token', token, {
        maxAge: 3600000000,
        httpOnly: true,
        domain: '.localhost:3000',
      }).status(201).send({
        data: {
          _id: user._id,
          email: user.email,
          name: user.name,
        },
      });
    })
    .catch((err) => {
      if (err.code === 11000) {
        next(new ConflictError('Пользователь с таким e-mail уже существует'));
      } else if (err.name === 'ValidationError') {
        next(new BadRequestError('Ошибка при проверке данных для пользователя'));
      } else {
        next(new InternalServerError('Произошла ошибка 500 на сервере'));
      }
    });
};

module.exports.logout = (req, res) => {
  res.clearCookie('token', { sameSite: 'none', secure: true });
  res.send({ loggedOut: true });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, { expiresIn: '30d' });
      res.cookie('token', token, {
        maxAge: 3600000000,
        httpOnly: true,
        sameSite: 'none',
        secure: true,
      })
        .send({ token });
    })
    .catch((err) => {
      next(new UnauthorizedError(err.message));
    });
};

module.exports.updateProfile = (req, res, next) => {
  const { name, email } = req.body;
  User.findByIdAndUpdate(req.user._id, { name, email }, { new: true, runValidators: true })
    .orFail(new NotFoundError('Ваш пользователь не найден'))
    .then((user) => {
      res.send({ data: user });
    })
    .catch((err) => {
      if (err.code === 11000) {
        next(new ConflictError('Пользователь с таким e-mail уже существует'));
      } else if (err.name === 'ValidationError') {
        next(new BadRequestError('Ошибка при проверке данных для обновления профиля пользователя'));
      } else {
        next(err);
      }
    });
};

module.exports.getProfile = (req, res, next) => {
  User.findById(req.user._id)
    .orFail(new NotFoundError('Ваш профиль не найден'))
    .then((user) => {
      res.send({ data: user });
    })
    .catch(next);
};
