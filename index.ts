import express, {Application} from 'express';
import {connect} from 'mongoose';
import {config as env} from 'dotenv';
import cors from 'cors';

// Importing Conrollers 
import Signup from './controllers/Auth/Signup';
import Login from './controllers/Auth/Login';
import MemeTemplate from './controllers/Memes/templates';
import Meme from './controllers/Memes/meme';


env ();

const app: Application = express ();

// Using Middlewares
app.use (cors ());
app.use (express.json ());

// Initializing Routes 
app.use ('/api/signup', Signup);
app.use ('/api/login', Login);
app.use ('/api/memes/templates', MemeTemplate);
app.use ('/api/memes', Meme);

const PORT = process.env.PORT || 5000;
connect (process.env.DB_URL || '').then (() => {
    app.listen (PORT, ()=>console.log (`Server started on port ${PORT}`));
}).catch (err => console.log (err));



