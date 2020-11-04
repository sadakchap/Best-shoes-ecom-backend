const express = require('express');
const { connectDB } = require('./db');
const app = express();
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

// import Routes

// USE MIDDLEWARES
app.use(cookieParser());
app.use(express.json());
app.use(cors({
    origin: process.env.CLIENT_URL
}));
if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'));
}

// use routes

app.use((req, res) => {
    return res.status(404).json({
        message: 'Page not found'
    });
});


// Connecting to DB & starting the SERVER
const PORT = process.env.PORT || 8000;
connectDB().then(() => app.listen(PORT, () => console.log(`Server is running ${PORT}`)));