var backup = require('mongodb-backup');
var encryptor = require('file-encryptor');
var fs = require('fs');
const { exec } = require('child_process');
const nodemailer = require('nodemailer');
require('dotenv').config({path: __dirname + '/../.env'})

exec('rm -rf sasame sasame.zip');
 
backup({
  uri: process.env.MONGODB_CONNECTION_URL,
  root: __dirname,
  callback: function(){

	var key = process.env.ENCRYPTION_KEY;

	var filesProcessed = 0;
	var numFiles = 0;

	// Encrypt files
	//within this dir is a dir for each collection
	var dir = 'sasame/';
    fs.readdir(dir, (err, dirs) => {
      dirs.forEach(function(sub_dir){
      	fs.readdir((dir + sub_dir), (err, files) => {
      		numFiles += files.length;
      		files.forEach(file => {
      			//encrypt into .dat
      			encryptor.encryptFile((dir + sub_dir + '/' + file), (dir + sub_dir + '/' + file.split('.')[0]+'.dat'), key, function(err) {
					//delete original
					fs.unlink(dir + sub_dir + '/' + file);
					++filesProcessed;
					//run on last iteration
					if(filesProcessed == numFiles){
						//now we need to zip sasame/
						var folderLocation =  'sasame';
						var zipLocation =  'sasame.zip';
						exec('zip -r '+zipLocation+' '+folderLocation, (error, stdout, stderr) => {
							//now delete unzipped folder
							exec('rm -rf ' + folderLocation);
							//now email the zipped file
							sendEmail('uriahsanders@ymail.com', 'Sasame Backup', 'Attached.', __dirname + '/' + zipLocation);
							console.log('Backup Complete.');
						});
					}
				});
      		});
      	});
      });
    });
  }
});

function sendEmail(to, subject, body, file){
    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    var mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: to,
      subject: subject,
      text: body,
      attachments: [
      	{
      		path: file
      	}
      ]
    };

    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
}