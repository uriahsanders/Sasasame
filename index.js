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
    Passage.find().sort([['_id', 1]]).exec(function(err, response){
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

var save = function(){
    //copy everything into /(sa)same
    //database is copied but unlinked to original
};

//for the future

var branch = function(){
    //Allow user to start their own Sasamatic Seed
};

app.listen(3000, () => {
    console.log("Sasame Started...");
});

// REWRITE HERE


//
// * Someone tweets “I hate Donald Trump”
// * For each groups of words in tweet, measure density of its category by num passages/categories within it
// * Choose the densest group
// * In this case ‘Donald Trump’
// * ‘Donald Trump’ category will have every passage ever written about Donald Trump
// * Iterate over passages
// * check if passage is also in the ‘I’ category and ‘hate’ category and every other category in the string
// * choose the passage that fits all first, or fits the most by the end.
// * This should produce an agreeable statement.

// Infinite Sieve
// This function should be constantly expanded
// in order to fractally categorize data.
// But for now we will anchor on the densest word
// and then find passages in that category that also match the other words
var infinite_sieve = function(post){
    //iterate over every group of words in post
    //later we will need to clean all but single spaces and 'pure words'
    words = post.split(' ');
    num_words = words.length;
    //we could do more but for now simply use the word
    //which has the densest category
    //as an anchor
    var density = 0;
    var anchor = null;
    for(var i = 0; i < num_words; ++i){
        temp = getDensityOfCategory(words[i]);
        if(temp > density){
            density = temp;
            anchor = words[i];
        }

    }
    // Now get all the passages in the category 'anchor'

    //iterate through all passages
    Passage.find().sort([['_id', 1]]).exec(function(err, passages){
        for(var i = 0; i < passages.length; ++i){
            content = passages[i].content;
        }
    });


};
