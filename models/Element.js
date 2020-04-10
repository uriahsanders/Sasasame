'use strict';
const mongoose = require('mongoose');

const elementSchema = mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    //passage the element belongs to
    passage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Passage'
    },
    //chapter the element belongs to
    chapter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chapter'
    },
    //date of creation
    date: {type: Date, default: Date.now},
    //methods and properties are evaluated js :O
    methods: [{
        type: String,
    }],
    properties: [{
        type: String,
    }]
});
module.exports = mongoose.model('Element', elementSchema, 'Elements');