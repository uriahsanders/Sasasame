const express = require('express');
const mongoose = require('mongoose');
const ejs = require('ejs');

var app = express();

app.use(express.static('./dist'));
app.set('view engine', 'ejs');
app.set('views', './views');

mongoose.connect('mongodb://localhost/sasame');
var postSchema = mongoose.Schema({
    author: String,
    rank: Number, //rank is the average of the array
    content: String
});
var Post = mongoose.model('Post', postSchema, 'Posts');

app.get('/', function(req, res) {
    Post.find({}, (err, posts) => {
        if(!err) {
            res.render('index', { posts });
        }
    })
});

var make_post = function(author, rank, content) {
    let post = new Post({
        author: author,
        rank: rank,
        content: content
    });
    post.save().then((data) => {
        console.log("inserted", data.content)
    }).catch((err) => {
        console.log(err);
    });
};

app.get('/submit', (req, res) => {
    let info = req.query;
    // author,
    // rank,
    // content
    make_post(info.name, 0, info.content);
    res.render("index");
});

// var post = new Post({
//     author: 'Uriah Sanders',
//     rank: 0,
//     content: 'Sasame is an intelligent program that automatically saves the world.'
// });
// post.save();

var rank_post = function(id, rank){
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
    console.log("Sasame Started...")
});