// This script is for clearing the database
'use strict';
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/sasame', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}, function(){
	//clear database
	// mongoose.connection.db.dropDatabase();
	console.log('Done');
	process.exit();
});