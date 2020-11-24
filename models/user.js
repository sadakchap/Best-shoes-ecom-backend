const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        unique: true
    },
    hashed_password: {
        type: String,
        required: true
    },
    bio: {
        type: String,
        maxlength: 256
    },
    role: {
        type: Number,
        default: 0
    },
    salt: String,
    purchases: {
        type: Array,
        default: []
    },
    is_verified: {
        type: Boolean,
        default: false
    },
    resetPasswordLink: {
        type: String,
        default: ''
    }
}, { timestamps: true });

userSchema.virtual('password')
    .set(function (password) {
        this._password = password;
        this.salt = uuidv4();
        this.hashed_password = this.securePassword(password);
    })
    .get(function () {
        return this._password;
    })

userSchema.methods = {
    securePassword: function (plainPassword) {
        if(!plainPassword) return ''
        return crypto.createHmac('sha256', this.salt)
                   .update(plainPassword)
                   .digest('hex');
    },
    authenticate: function (password) {
        return this.securePassword(password) === this.hashed_password
    }
};

module.exports = User = mongoose.model('User', userSchema);