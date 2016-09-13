var passport   =    require('passport');
var Account    =    require('./models/account');
var router     =    require('express').Router();
var mongoose   =    require('mongoose');
var db         =    require('./db');
var creditentials = require('./creditentials');

//NOTE: Update it so it connects using creditentials.js
console.log("Your creditentials file is currently using this as the mongodb url: "+creditentials.mongoURL);

//connect to mongoose
mongoose.connect(creditentials.mongoURL, function(err){
  if(err) console.log("Could not connect to the db");
});


/********************************************
* PLEASE ENTER THE USERNAME YOU REGISTERED
*********************************************/
var _USERNAME   =    "";



if(_USERNAME == ""){console.log("WARNING: PLEASE MODIFY SCRIPT.JS: _USERNAME FIELD TO INCLUDE YOUR USERNAME YOU WISH TO MAKE ADMIN"); process.exit(-1);}
console.log("NOTE: THIS IS A SETUP SCRIPT PLEASE MODIFY SETUP.JS AFTER REGISTERING AN ACCOUNT TO ESCALATE YOUR PRIVILEGES TO MODERATOR");


Account.findOneAndUpdate({"username":_USERNAME}, {$set:{"moderator":true}},{ new: true },function(err,account){
  if(err){console.log("unfortunately could not find user and escalate privilegs");process.exit(-1);}
  else{
    console.log("User: "+_USERNAME+" moderator status: "+account.moderator);
    process.exit(1);
    //return;
  }

});
