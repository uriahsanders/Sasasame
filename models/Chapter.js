'use strict';
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');

const chapterSchema = mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    title: String, //name of the category
    //passages that belong to this category
    passages: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Passage'
    }],
    date: {type: Date, default: Date.now},
    //which users find this chapter useful?
    stars: Number,
    access: Number,
    flagged: Boolean //content warning
});
chapterSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Chapter', chapterSchema, 'Chapters');