'use strict';
const express = require('express');
const mongoose = require('mongoose');
const ejs = require('ejs');

var app = express();
app.use(express.static('./dist'));
app.set('view engine', 'ejs');
app.set('views', './views');

const options = {
    useNewUrlParser: true
};
mongoose.connect('mongodb://localhost/sasame', { useNewUrlParser: true }, function(err){

    if (err) {
        return console.error(err);
    }
    setTimeout( () => {
        mongoose.connect('mongodb://localhost/sasame', options);
    }, 5000);
});
var categorySchema = mongoose.Schema({
    author: String,
    title: String, //name of the category
    passages: [Number], //array of passage IDs
});
var passageSchema = mongoose.Schema({
    author: String,
    rank: Number, //rank is the average of the array
    content: String,
});
var Passage = mongoose.model('Post', passageSchema, 'Posts');
var Category = mongoose.model('Category', passageSchema, 'Categories');

app.get('/', function(req, res) {
    Passage.count({}, function( err, count){
        console.log(count);
        Passage.findOne().sort({_id: -1}).exec(function(err, passage) {
            if(!err) {
                res.render('index', { passage: passage, light: count });
            }
            else{
                console.log(err);
            }
        });
    });
    // Passage.find({}, (err, passages) => {
    //     if(!err) {
    //         res.render('index', { fruit: passages });
    //     }
    // });
});

app.get('/about', function(req, res) {
    res.render('about', { posts });
});
app.get('/history', function(req, res) {
    res.render('history', { posts });
});
app.get('/team', function(req, res) {
    res.render('blog', { posts });
});
app.get('/applications', function(req, res) {
    res.render('blog', { posts });
});
app.get('/roots', function(req, res) {
    Passage.find().sort([['_id', -1]]).exec(function(err, response){
        res.render("roots", {book: response});
    });
});
var add_passage = function(content, callback) {
    let post = new Passage({
        content: content
    });
    post.save().then((data) => {
        console.log("inserted", data.content);
        callback();
    }).catch((err) => {
        console.log(err);
    });
};
var add_category = function(title, callback) {
    let category = new Category({
        title: title
    });
    category.save().then((data) => {
        callback();
    }).catch((err) => {
        console.log(err);
    });
};
var add_passage_to_category = function(passageID, categoryID, callback) {
    Category.find({_id:categoryID}).sort([['_id', 1]]).exec(function(err, category){
        category.passages.append(passageID);
        category.save().then((data) => {
            callback();
        });
    });
};
var get_density_of_category = function(category){
    return category.passages.length;
};

app.get('/feed_sasame', (req, res) => {
    let info = req.query;
    // author,
    // rank,
    // content
    Passage.findOne().sort({_id: -1}).exec(function(err, passage) {
        if (info.content != passage.content){
            add_passage(info.content, function(){
                res.redirect("/");
            });
        }
        else{
            add_passage('Light', function(){
                res.redirect("/");
            });
            res.redirect("/");
        }
    });
});
app.get('/fruit', (req, res) => {
    let test = null;
    Passage.find().sort([['_id', 1]]).exec(function(err, response){
        res.render("fruit", {fruit: response});
    });
});

// var post = new Post({
//     author: 'Uriah Sanders',
//     rank: 0,
//     content: 'Sasame is an intelligent program that automatically saves the world.'
// });
// post.save();

var rank_passage = function(id, rank){
    Post.find({_id: id}).exec(function(err, res){
        res.rank.push(rank);
        let average = (array) => array.reduce((a, b) => a + b) / array.length;
        res.rank = Math.round(average(res.rank));
        res.save();
    });
};

var posts = [];

// -1 is junk, 0 is unranked, 1 is least, 3 is greatest
var ranks = [-1, 0, 1, 2, 3];

var textForAdding = 'Add a better explanation of Sasame.';
var textForPathing = ['Best', 'Worst', 'Junk'];

var display = "seed"; // start by showing the seed
var speech = function(user_speech) {
    // Update display
    display = user_speech;
    // Add new Speech to database as Junk
    make_post('Anon', -1, user_speech);

};

var sieve = function(id, rank){
    //rank the speech in database
    rank_post(id, rank);
};

var path = function(user_path){
    var paths = textForPathing; //same options
    //Grab records from DB in appropriate order depending on rank
};
app.listen(3000, () => {
    console.log("Sasame Started...");
});


