const { celebrate, Joi } = require('celebrate');

const movieRouter = require('express').Router();
const { urlRegexp } = require('../utils/constants');
const {
  createMovie, getMovies, deleteMovie,
} = require('../controllers/movies');

movieRouter.get('/movies', getMovies);
movieRouter.post('/movies', celebrate({
  body: Joi.object().keys({
    country: Joi.string().required(),
    director: Joi.string().required(),
    duration: Joi.number().integer().required(),
    year: Joi.string().required(),
    description: Joi.string().required(),
    image: Joi.string().required().pattern(urlRegexp),
    trailerLink: Joi.string().required().pattern(urlRegexp),
    thumbnail: Joi.string().required().pattern(urlRegexp),
    movieId: Joi.number().integer().required(),
    nameRU: Joi.string().required(),
    nameEN: Joi.string().required(),
  }),
}), createMovie);
movieRouter.delete('/movies/:movieId', celebrate({
  params: Joi.object().keys({
    movieId: Joi.string().required().hex().length(24),
  }),
}), deleteMovie);
module.exports = movieRouter;
