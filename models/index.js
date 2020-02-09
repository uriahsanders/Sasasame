'use strict';
const mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);
mongoose.connect('mongodb://localhost/sasame', function(err){
    if (err) {
        return console.error(err);
    }
    setTimeout( () => {
        mongoose.connect('mongodb://localhost/sasame');
    }, 5000);
});
var bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10;
var chapterSchema = mongoose.Schema({
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
    level: Number,
    date: {type: Date, default: Date.now},
    //how many people like this chapter?
    stars: Number,
    // JSON for whether chapter is shared, public, design, etc.
    metadata: String,
    // What rules are being used to read the metadata?
    //also JSON
    keySchema: String,
    flagged: Boolean //content warning
});
chapterSchema.index({name: 'text'});
chapterSchema.plugin(mongoosePaginate);
var passageSchema = mongoose.Schema({
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
    //record of chapters the passage came from
    sourceChapters: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chapter'
    }],
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
var userSchema = mongoose.Schema({
    password: { type: String, required: true, index: {unique:true} },
    queue: String,
    date: {type: Date, default: Date.now},
    name: {type: String, required: [true, "can't be blank"]},
    email: {type: String, lowercase: true, 
        required: [true, "can't be blank"], match: [/\S+@\S+\.\S+/, 'is invalid'], index: true},
});
// userSchema.pre('save', function(next) {
//     var user = this;


