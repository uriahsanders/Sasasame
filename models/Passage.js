'use strict';
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');

const passageSchema = mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    content: String,
    //chapter the passage belongs to
    chapter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chapter'
    },
    //parent passage the passage belongs to
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Passage'
    },
    // sub passages under this passage
    passages: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Passage'
    }],
    date: {type: Date, default: Date.now},
    //chapter the passage came from
    sourceChapter: String,
    //how many people like this passage?
    stars: Number,
    //JSON for properties
    metadata: String,
    // What rules are being used to read the metadata?
    //also JSON
    keySchema: String,
    //is this passage a key schema?
    isSchema: Boolean,
    flagged: Boolean //content warning
});
passageSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Passage', passageSchema, 'Passages');