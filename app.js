const express = require('express');
const { mongoose } = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const router = require('./router');
const errorMiddleware = require('./middlewares/error-middleware');
const app = new express()
require('dotenv').config();

app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use('/user', router);

app.use(errorMiddleware)

mongoose.set('strictQuery', false);

const start = async () => {
    try {
      await mongoose
        .connect(
          process.env.mongoUrl
        )
        .then(() => {
          console.log('Mongo connected...');
        });
        
      await app.listen(process.env.PORT, (err) => {
        if (err != null) {
          console.log(err);
        } else {
          console.log(`Server started on port 5000...`);
        }
      });
    } catch (error) {
      console.log(error);
    }
  };
  
  start();