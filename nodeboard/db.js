var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  passportLocalMongoose = require('passport-local-mongoose');

  //object id is used for some of the schea instead of referring to entire instances of other schema
  var ObjectId = mongoose.Schema.Types.ObjectId;

  //had to include this because of dependency from other schemas
  var Account = new Schema({
    username:     {type:String,required:true},
    first_name:   {type:String,require:true},
    last_name:    {type:String,require:true},
    email:        {type:String,require:true},
    moderator:    {type:Boolean,required:true,default:false}, //used for teachers
    password:     {type:String,require:true}
  });

//classroom schema, single moderator = teacher
var classroomSchema = new Schema({
  name: {type:String, required:true},
  description: {type:String,required:true},
  students: [Account],
  moderators: Account
});

//homework schmea,
var homeworkScehma = new Schema({
  class: {type:ObjectId, required:true}, //should also have students
  name: {type: String, required: true},
  due: {type:Date, required:false},
  description: {type:String, required:true},
  resubmissions: {type:Boolean,default:true,required:true},
  moderator: Account,
  posted: {type:Date},
  students: [Account]
});

//resource schema
var resourceSchema = new Schema({
  class: {type:ObjectId, required:true}, //should also have students
  name: {type: String, required: true},
  description: {type:String, required:true},
  link: {type:String,required:false},
  moderator: Account
});

//student homework
var studentHomeworkSchema = new Schema({
  class: {type:ObjectId, required:true}, //should also have students
  posted: {type:Date, required:true},
  assignment: homeworkScehma,
  student: {type: Account, required: true},
  solution: {type:String, required: true},
  studentId: {type: ObjectId,required:true},
  grade: {type:Number}
});



/*
  Announcements should automatically be pushed as updates
  so everytime a homework request occurs, it should be updated
  announcements can also be set manually
*/
var announcementSchema  = new Schema({
  class: {type:ObjectId, required:true}, //should also have students
  name: {type: String, required: true},
  due: {type:Date, required:false},
  description: {type:String, required:true},
  urgent: {type:Boolean}, //determines if it should be emailed
  assignment: {type:homeworkScehma, required:false}, //allows for homeworks to be an announcement
  resource: {type:resourceSchema, required:false},
  moderator: Account,
  posted: {type:Date},
  students: [Account]
});


// Classroom.plugin(passportLocalMongoose);
var Classroom = mongoose.model("Classroom",classroomSchema);
var Homework = mongoose.model("Homework", homeworkScehma);
var Announcement = mongoose.model("Announcement",announcementSchema);
var Resource = mongoose.model("Resource",resourceSchema);
var StudentHomework = mongoose.model("StudentHomework", studentHomeworkSchema);
// mongoose.connect('mongodb://localhost/nodeboard');

module.exports = Classroom;
module.exports = Homework;
module.exports = Announcement;
module.exports = Resource;
module.exports = StudentHomework;
