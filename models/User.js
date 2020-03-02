'use strict';
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');

const userSchema = mongoose.Schema({
    joined: {type: Date, default: Date.now},
    email: {type: String},
    username: String,
    name: String,
    thumbnail: String,
    password: String,
    verified: Boolean,
    queue: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Passage'
    }],
});

module.exports = mongoose.model('User', userSchema, 'Users');