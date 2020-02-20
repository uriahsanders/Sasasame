// This file is for removing junk data in development
'use strict';
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require("body-parser");
const helmet = require('helmet');
const PORT = process.env.PORT || 3000;
require('dotenv').config();
const Chapter = require('../models/Chapter');
const Passage = require('../models/Passage');
const User = require('../models/User');
mongoose.connect('mongodb://localhost/sasame', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
});
// Chapter.deleteMany({}, function(err, chapters){
//     if (err) console.log(err);
//     console.log(chapters);
//     process.exit(1);
// });
User.dropIndex("password_1");
User.find({}, function(err, users){
    if (err) console.log(err);
    console.log(users);
    process.exit(1);
});
// Passage.deleteMany({}, function(err, passages){
//     if (err) console.log(err);
//     console.log(passages);
//     process.exit(1);
// });
