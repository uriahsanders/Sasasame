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
    author: Number,
    title: String, //name of the category
    //passages that belong to this category
    passages: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Passage'
    }], //array of passage IDs
    //chapters that belong to this category
    chapters: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chapter'
    }],
    //chapter the category belongs to
    chapter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chapter'
    },
    golden: Boolean,
    votes: Number,
    level: Number,
    addPassageAllowed: Boolean,
    addChapterAllowed: Boolean,
    //Golden Road Chapters have the same key structure as all their passages
    keys: [String]

});
chapterSchema.plugin(mongoosePaginate);
var passageSchema = mongoose.Schema({
    author: Number,
    content: String,
    keys: [String],
    //chapter the passage belongs to
    chapter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chapter'
    },
    //chapter the passage came from
    sourceChapter: String,
    golden: String,
    votes: Number,
});
passageSchema.plugin(mongoosePaginate);
// Perfect 100 Scheme
// Uriah is 7
// GRA members are 66
// Chromia is 9 (same privileges as 7 plus Leader in the Rules)
// Akira is 99
// Default is 100
// Deszha and Key have no Number (0, not in the 100) (same privileges as 7)
// 1 (same privileges as 7)
// Relax, Wabi, Jeremy, Mohamed, Arty are 10
var userSchema = mongoose.Schema({
    perfect: Number,
    password: { type: String, required: true, index: {unique:true} },
});
userSchema.pre('save', function(next) {
    var user = this;

    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) return next();

    // generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) return next(err);

        // hash the password using our new salt
        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) return next(err);

            // override the cleartext password with the hashed one
            user.password = hash;
            next();
        });
    });
});

userSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};
module.exports.Passage = mongoose.model('Passage', passageSchema, 'Passages');
module.exports.Chapter = mongoose.model('Chapter', chapterSchema, 'Chapters');
module.exports.User = mongoose.model('User', userSchema, 'Users');
