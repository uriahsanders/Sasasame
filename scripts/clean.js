// This file is for removing junk data
var models = require('./models');
//Actually create the categories
models.Chapter.deleteMany({}, function(err, chapters){
    if (err) console.log(err);
    console.log(chapters);
    process.exit(1);
});
