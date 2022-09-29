const { celebrate, Joi } = require('celebrate');

const movieRouter = require('express').Router();
const {
  createMovie, getMovies, deleteMovie,
} = require('../controllers/movies');

movieRouter.get('/movies', getMovies);
movieRouter.post('/movies', celebrate({
  body: Joi.object().keys({
    country: Joi.string(),
    director: Joi.string().required(),
    duration: Joi.number().integer().required(),
    year: Joi.string(),
    description: Joi.string().required(),
    image: Joi.string(),
    trailerLink: Joi.string(),
    thumbnail: Joi.string(),
    movieId: Joi.number().integer().required(),
    nameRU: Joi.string().required(),
    nameEN: Joi.string(),
  }),
}), createMovie);
movieRouter.delete('/movies/:movieId', celebrate({
  params: Joi.object().keys({
    movieId: Joi.string().required().hex().length(24),
  }),
}), deleteMovie);
module.exports = movieRouter;
