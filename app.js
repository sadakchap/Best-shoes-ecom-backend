require('dotenv').config();
const express = require('express');
const { connectDB } = require('./db');
const app = express();
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const cors = require('cors');

// import Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const productRoutes = require('./routes/product');
const categoryRoutes = require('./routes/category');
const orderRoutes = require('./routes/order');

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
app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', productRoutes);
app.use('/api', categoryRoutes);
app.use('/api', orderRoutes);

app.use((req, res) => {
    return res.status(404).json({
        message: 'Page not found'
    });
});


// Connecting to DB & starting the SERVER
const PORT = process.env.PORT || 8000;
connectDB().then(() => app.listen(PORT, () => console.log(`Server is running ${PORT}`)));