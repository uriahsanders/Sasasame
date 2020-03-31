var restore = require('mongodb-restore');
var encryptor = require('file-encryptor');
var fs = require('fs');
const { exec } = require('child_process');
require('dotenv').config({path: __dirname + '/../.env'})
var key = process.env.ENCRYPTION_KEY;
var numFiles = 0;
var filesProcessed = 0;

//first unzip
exec('unzip sasame.zip', (err, stdout, stderr) => {
	// Decrypt files
	//within this dir is a dir for each collection
	var dir = 'sasame/';
	fs.readdir(dir, (err, dirs) => {
	  dirs.forEach(function(sub_dir){
	  	fs.readdir((dir + sub_dir), (err, files) => {
	  		numFiles += files.length;
	  		files.forEach(file => {
	  			encryptor.decryptFile((dir + sub_dir + '/' + file), (dir + sub_dir + '/' + file.split('.')[0]+'.bson'), key, function(err) {
				  // Decryption complete.
				  console.log('Decrypted ' + file);
				  //delete original
				  fs.unlink(dir + sub_dir + '/' + file);
				});
				++filesProcessed;
				//run on last iteration
				if(filesProcessed == numFiles){
					restore({
					  uri: process.env.MONGODB_CONNECTION_URL,
					  root: __dirname + '/sasame',
					  drop: true,
					  callback: function(){
					  	console.log('Database Restored.');
					  	//now backup the data again so it is always encrypted
					  	//this also cleans the dir
					  	exec('node backup.js');
					  }
					});
				}
	  		});
	  	});
	  });
	});
});