// When we add new fields we may want to update all documents with defaults
'use strict';
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require("body-parser");
const helmet = require('helmet');
const PORT = process.env.PORT || 3000;
require('dotenv').config({path: __dirname + '/../.env'})
const Chapter = require('../models/Chapter');
const Passage = require('../models/Passage');
const User = require('../models/User');
mongoose.connect('mongodb://localhost/sasame', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
});
// Chapter.updateMany({}, {}, function(err, chapters){
//     if (err) console.log(err);
//     console.log(chapters);
// });
// User.updateMany({}, {}, function(err, users){
//     if (err) console.log(err);
//     console.log(users);
//     process.exit(1);
// });
Chapter.updateMany({}, {
	flagged: false,
}, function(err, passages){
    if (err) console.log(err);
    console.log(passages);
    console.log('Done');
    process.exit();
});