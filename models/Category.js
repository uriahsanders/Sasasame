'use strict';
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');

const categorySchema = mongoose.Schema({
    title: String,
    passages: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Passage'
    }],
    chapters: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chapter'
    }],
});
categorySchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Category', categorySchema, 'Categories');