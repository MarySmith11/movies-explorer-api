require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const { errors } = require('celebrate');
const { limiter } = require('./middlewares/rate-limiter');
const { errorHandler } = require('./middlewares/error-handler');
const NotFoundError = require('./errors/not-found-err');
const userAuthRouter = require('./routes/userAuth');
const { auth } = require('./middlewares/auth');
const userRouter = require('./routes/users');
const movieRouter = require('./routes/movies');
const { requestLogger, errorLogger } = require('./middlewares/logger');

const { PORT = 3000, NODE_ENV = 'development', DB_ADDRESS = 'mongodb://127.0.0.1:27017/moviesdb' } = process.env;
const app = express();

mongoose.connect(DB_ADDRESS, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Кросс-доменные запросы
const corsOptions = {
  origin: [
    'https://marydiploma.nomoredomains.icu',
    'http://marydiploma.nomoredomains.icu',
  ],
  credentials: true,
};
app.use(cors(corsOptions));

app.use(requestLogger);

// Ограничитель
app.use(limiter);

app.use(helmet());
app.use(cookieParser());
app.use(bodyParser.json());

// Регистрация/авторизация
app.use(userAuthRouter);

// Проверка авторизации
app.use(auth);

// Роуты пользователя
app.use(userRouter);
// Роуты фильмов
app.use(movieRouter);

if (NODE_ENV === 'production') {
  app.get('/crash-test', () => {
    setTimeout(() => {
      throw new Error('Сервер сейчас упадёт');
    }, 0);
  });
}

app.use((req, res, next) => {
  next(new NotFoundError('Эндпоинт не найден'));
});

app.use(errorLogger);

app.use(errors());

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}.`);
});
