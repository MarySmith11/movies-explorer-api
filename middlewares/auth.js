const jwt = require('jsonwebtoken');
const UnauthorizedError = require('../errors/unauthorized-err');
require('dotenv').config();

const { JWT_SECRET = '111111111' } = process.env;

/* eslint-disable consistent-return */
module.exports.auth = (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    return next(new UnauthorizedError('Необходима авторизация'));
  }

  let payload;

  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return next(new UnauthorizedError('Необходима авторизация'));
  }

  req.user = payload;
  next();
};
