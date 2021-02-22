'use strict';
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');

const chapterSchema = mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    title: String, //name of the category,
    description: String,
    //passages that belong to this category
    passages: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Passage'
    }],
    date: {type: Date, default: Date.now},
    //which users find this chapter useful?
    stars: Number,
    deleted: Boolean,
    access: String,
    exclusive: Boolean,
    //have public access
    admins: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    //have protected access
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    distraction_free: Boolean,
    tools: Boolean,
    autoplay: Boolean,
    paginate: Boolean,
    categories: String,
    deleted: {
        type: Boolean,
        default: false
    },
    css: String,
    flagged: {
        type: Boolean,
        default: false
    } //content warning
});
chapterSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Chapter', chapterSchema, 'Chapters');