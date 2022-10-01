const Movie = require('../models/movie');
const BadRequestError = require('../errors/bad-request-err'); // 400
const InternalServerError = require('../errors/internal-server-err'); // 500
const BadAccessError = require('../errors/bad-access-err'); // 403

module.exports.createMovie = (req, res, next) => {
  const owner = req.user._id;
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
  } = req.body;
  Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
    owner,
  })
    .then((movie) => res.send({ data: movie }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Произошла ошибка при проверке данных для создания фильма'));
      } else {
        next(new InternalServerError('Произошла ошибка 500 на сервере'));
      }
    });
};

module.exports.deleteMovie = (req, res, next) => {
  Movie.findOneAndRemove({ _id: req.params.movieId, owner: req.user._id })
    .orFail(new BadAccessError('Фильма с таким id у вас нет'))
    .then((movie) => {
      res.send({ data: movie });
    })
    .catch(next);
};

module.exports.getMovies = (req, res, next) => {
  Movie.find({ owner: req.user._id })
    .then((movieList) => res.send({ data: movieList }))
    .catch(next);
};
