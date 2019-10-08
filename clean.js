// This file is for removing junk data
var models = require('./models');
//Actually create the categories
models.Category.deleteMany({}, function(err, categories){
    if (err) console.log(err);
    console.log(categories);
    process.exit(1);
});
