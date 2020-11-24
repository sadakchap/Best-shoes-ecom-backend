const mongoose = require('mongoose');

exports.connectDB = async() => {
    const MONGO_URL = `mongodb+srv://ticktok:${process.env.DB_USER_PASSWORD}@tick.jm1v9.mongodb.net/${process.env.DB_NAME}`;
    try {
        const conn = await mongoose.connect(MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: true
        });
        console.log(`DB CONNECTED ${conn.connection.port}`);
    } catch (err) {
        console.log(err);
        console.log(`DB CONNECTION FAILED`);
        process.exit(1);
    }
};
