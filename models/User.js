'use strict';
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');

const userSchema = mongoose.Schema({
    date: {type: Date, default: Date.now},
    name: {type: String},
});

module.exports = mongoose.model('User', userSchema, 'Users');