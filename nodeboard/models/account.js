var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  passportLocalMongoose = require('passport-local-mongoose');

var Account = new Schema({
  username:     {type:String,required:true},
  first_name:   {type:String,require:true},
  last_name:    {type:String,require:true},
  email:        {type:String,require:true},
  moderator:    {type:Boolean,required:true,default:false}, //used for teachers
  password:     {type:String,require:true}
});

Account.plugin(passportLocalMongoose);

module.exports = mongoose.model('Account',Account);
