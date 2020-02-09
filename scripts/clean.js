// This file is for removing junk data
const Chapter = require('../models/Chapter');
const Passage = require('../models/Passage');
//Actually create the categories
Chapter.deleteMany({}, function(err, chapters){
    if (err) console.log(err);
    console.log(chapters);
    process.exit(1);
});
