import express from "express";
import { engine } from 'express-handlebars';
import mongoose from "mongoose";

import productsRouter from './routes/products.router.js';
import cartsRouter from './routes/carts.router.js';
import sessionsRouter from './routes/sessions.router.js'
import viewsRouter from './routes/views.router.js'

import cookieParser from "cookie-parser"
import session from "express-session";
import MongoStore from "connect-mongo";

import passport from "passport"
import initializePassport from "./config/passport.config.js";

import config from "./config/config.js"

const app = express();

mongoose.connect(config.mongoUrl)

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(session({
    store:MongoStore.create({
        mongoUrl:config.mongoUrl,
        mongoOptions:{useNewUrlParser:true,useUnifiedTopology:true},
    }),
    secret:"asd3ñc3okasod",
    resave:false,
    saveUninitialized:false
}))
initializePassport();
app.use(passport.initialize());
app.use(passport.session());

app.use('/api/products', productsRouter);

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');

app.use('/api/products', productsRouter);
app.use('/api/cart', cartsRouter)
app.use('/api/sessions', sessionsRouter)
app.use('/', viewsRouter)

app.get("/", (req,res) => {
    res.redirect(`http://localhost:${config.port}/login`);
})

app.listen(config.port,()=>console.log("Listening on PORT", config.port))