
//required libraries
var passport   =    require('passport');
var Account    =    require('./models/account');
var router     =    require('express').Router();
var mongoose   =    require('mongoose');
var db         =    require('./db');
var nodemailer =    require('nodemailer');
//models required
var Classroom  =    mongoose.model('Classroom');
var Homework   =    mongoose.model('Homework');
var Resource   =    mongoose.model('Resource');
var Announcement=   mongoose.model('Announcement');
var StudentHomework=mongoose.model('StudentHomework');
const _URL      =   "http://localhost"; //used for api stuff

var creditentials = require('./creditentials');



var transporter = nodemailer.createTransport(creditentials.smtpConfig);
//console.log();

//object id is used for some of the schea instead of referring to entire instances of other schema
var ObjectId = mongoose.Schema.Types.ObjectId;

//debugging function
function logOut(model,msg,param){
  console.log("----------------\n");
  console.log("Currently testing "+model);
  console.log(msg+"= "+param);
  console.log("----------------\n");
}



/***********************
* AJAX CALL STUFF I GUESS
***********************/
//NOTE: Change to post
//This creates an announcement then use nodemailer to mail a notification.
router.post('/api/announcements',function(req,res){
  //console.log(req.body);
  Classroom.findOne({_id:req.body.id},function(err,classroom){
    if(err) return err;
    else{

      var studentsList = [];
      //function used forEach
      function logArray(element,index){
        studentsList.push(element.email);
      }

      //for(var i =0; i < classroom.students.length; i++)
        //studentsList.push(classroom.students[i].email);

      //NOTE: This is where i use forEach, i use forEach
      //to push each student email into an array i later reduce
      //the foreach function replaced the above for loop commented out
      classroom.students.forEach(logArray);


      /*******************************************
      * i use reduce to reduce the students emails into one
      * string to pass to nodemailer
      *********************************************/
      //NOTE: THIS IS WHERE I USE REDUCE, I reduce the array list
      //into a string so i can pass it to nodemailer
      var reducedList = studentsList.reduce(function(prev,next){
        prev += " , "+next;
        return prev;
      });

      var htmlStr = '<a href="'+_URL+'/classroom/id?class='+classroom._id+'"></a>';
      //console.log(htmlStr);


      var mailOptions = {
          from: creditentials.smtpConfig.auth.user, // sender address
          to: reducedList, // list of receivers
          subject: 'New assignment added from '+classroom.name, // Subject line
          text: 'A new assignment has been posted. Please check the course page for my information. ', // plaintext body
          html: htmlStr // html body
      };

      //sends the mail, sicne its an api we dont care about async error.
      transporter.sendMail(mailOptions, function(error, info){
          if(error){
              return console.log(error);
          }
          console.log('Message sent: ' + info.response);
      });
    }
  });
});

/*********************
* Resource views below
**********************/
router.get('/resources/create',function(req,res){
  //rsconsole.log("req.user="+req.user);
  if(req.user == undefined){
    //res.send('Unauthorized accessrs');
    res.redirect('/login');
  }

  if(!req.param("id")){ res.send("class id not specified");}

  if(req.user){
    Classroom.findOne({_id:req.param("id")}, function(err,classroom){
    if(err){
      res.send("An error occured");
    }
    //for some reason i had to cast them as strings for this comparison to work...
    //if(String(classroom.moderators._id) != String(req.user._id)){

    if(String(classroom.moderators._id) != String(req.user._id)){
      res.send("Unauthorized access!");
    }
    else{

      res.render("./resources/create.hbs",{user:req.user,classroom:classroom,classId:classroom.id})
      }
    });
  }

});


router.post('/resources/create',function(req,res){
  if(req.user){
    Classroom.findOne({_id:req.param("id")}, function(err,classrooms){
      if(err) res.send("Could not find class");

      var newResource= Resource({
        class: classrooms._id,
        name: req.body.resource_name ,
        description:req.body.resource_description,
        link: req.body.resource_link,
        students: classrooms.students,
        moderators: req.user
      });
      newResource.save(function(err) {
        if (err){
          console.log("Could not create classroom"+err+"1");
          req.session.msg = err;
          res.redirect("/resources/create?id="+req.param("id"));
        } //throw err;
        else{

          //populate
          var newAnnouncement = Announcement({
              class: classrooms._id,
              name: "New resource added"+req.body.resource_name,
              description:req.body.resource_description,
              resource: newResource,
              students: classrooms.students,
              posted: new Date().toJSON().slice(0,10),
              moderator: req.user
              //students:
          });

          newAnnouncement.save(function(err){
            if(err){
              console.log("could not create announcement");
            }

            // NOTE: Nodemailer stuff here for future
          });

          //NOTE: Add so that req.session.msg is displayed on success
          req.session.msg = "Resource has been created";
          req.session.alert = "success";
          res.redirect('/classroom/id?class='+req.param("id"));


        }


      });
    });
  }

  else{
    res.send("Unauthorized access");
  }

});


router.get('/resources/view',function(req,res){
  if(req.user){
    if(req.param("classId")){
      Classroom.findOne({_id:req.param("classId")},function(err,classrooms){

        var single_view = false; //single view
        //find one
        if(req.param("id")){
          single_view = true;
          Resource.findOne({_id:req.param("id")},function(err,resources){

            if(err) res.send("could not find resource");
            res.render('./resources/view',{single_view:single_view,layout:'display/layout',classrooms:classrooms,classId:classrooms._id,user:req.user,resources:resources,title:classrooms.name});
          });
        }
        //find all
        else{
          Resource.find({class:req.param("classId")},function(err,resources){
            if(err) res.send("could not find class");
            res.render('./resources/view',{single_view:single_view,layout:'display/layout',classrooms:classrooms,classId:classrooms._id,user:req.user,resources:resources,title:classrooms.name});
          });
        }

      });

    }
  }
  //user not signed in
  else{
    res.send("Unauthorized access");
  }
});

/*****************
* MODIFY VIEWS BELOW
*******************/
router.get('/modify/enrollment',function(req,res){
  if(req.user){
    if(req.param("id")){
      Classroom.find({_id:req.param("id")},function(err,classrooms){
        if(err){
          console.log("error occured");
        }
        var is_admin = false;
        //if the user is moderator, specify flag
        if(classrooms[0].moderators.username == req.user.username)
        is_admin = true;
        res.render("./modify/enrollment",{user:req.user,classrooms:classrooms, is_admin:is_admin,classId:classrooms[0]._id})
      });

    }
    else{
      res.send("no id speicfied");
    }
  }
  else{
    res.redirect("/login");
  }
});

//API USED FOR AJAX CALL
router.get('/modify/delete/',function(req,res){
  if(req.user){
    if(req.param("id")){
      if(req.param("username")){
        Classroom.findOne({_id:req.param("id")},function(err,classrooms){
          if(err) res.send(err);
          else{
            //logOut("/modify/delete","post to=",classrooms);

          }

          //if(classroom.moderator == req.user)
        });
      }
      else{
        res.send("please specify a username");
      }

    }
    else{
      res.send("Please specify an class Id");
    }

  }
  else{
    res.send("Unauthorized access, please login");
  }
});


/******************************
* Homepage routes
********************************/

router.get('/', function(req,res){
  //console.log(req.user);
  if(req.user){
    Announcement.find({students:{$elemMatch:{"username":req.user.username}}},null,{sort:'-date'}, function(err, announcements){
    Classroom.find({students:{$elemMatch:{"username":req.user.username}}}, function(err, classrooms){
      //cannot find any classes you are currently enrolled too
      if(err){
        //reset session messave variable
        var msg = req.session.msg;
        req.session.msg = "";
          res.render('index', {announcements:announcements,user: req.user, title: "Home page",msg:msg,enrolled:false,classrooms:"You are not currently enrolled in a class"});
      }
      //reset session message variable
      var msg = req.session.msg;
      req.session.msg = "";
        res.render('index', {announcements:announcements,user: req.user, title: "Home page",msg:msg,enrolled:true,classrooms:classrooms});
      //res.render('./display/my_classes', {user:req.user, classrooms:classrooms});
    });
  }).limit(5);
  }

  else{
    var msg = req.session.msg;
    req.session.msg = "";
      res.render('index', {user: req.user, title: "Home page",msg:msg,enrolled:false,classrooms:"You are not currently enrolled in a class"});
  }

});


/******************************
*ASSIGNMENT ROUTES BELOW
********************************/

router.get('/assignment/grades',function(req,res){

  if(req.user){
    StudentHomework.find({studentId:req.user._id}, function(err,homeworks){
      console.log(homeworks.length);
      if(err || homeworks.length == 0) res.send("Could not find anything, have you tried submitting an assignment?");
      else{
        res.render('./assignment/grades',{user:req.user,homeworks:homeworks,classId:homeworks[0].class, title:"My Grades",layout:'./display/layout'});
        //res.send(homeworks);
      }
    });

  }

  else{
    res.send("Unauthorized access, please login");
  }
});

router.get('/upload/assignment',function(req,res){
  if(req.user){
    if(req.param("id")){

      Homework.findOne({_id:req.param("id")},function(err,homework){

        if(err){res.send("could not locate assignment");}
        else{
          res.render('./assignment/upload',{user:req.user,layout:'/display/layout',homework:homework,classId:homework.class});
        }
      });

    }
    else{
      res.send("please specify assignment id");
    }

  }
  else{
    res.send("Unauthorized access, please login");
  }
});


router.post('/upload/assignment',function(req,res){
  if(req.user){
    if(req.param("id")){
      Homework.findOne({_id:req.param("id")},function(err,homework){
        //StudentHomework.findOne()
        //logOut("/upload/assignment","req.param(id)=",req.param("id"));
        //logOut("/upload/assignment","homework=",homework);
        if(err) { res.send("could not locate original assignment");}
        var newStudentHomework = StudentHomework({
          class: homework.class,
          posted: new Date().toJSON().slice(0,10),
          assignment: homework,
          student: req.user,
          studentId: req.user._id,
          solution: req.body.solution
        });
        newStudentHomework.save(function(err){
          if(err) res.send("Could not process submission at this time");
          else{
            //res.send("Homework submitted successful!");
            res.redirect("/assignment/grades");
          }
        });

      });
    }
    else{
      res.send("please specify the id of the assignment");
    }

  }

  else{
    res.send("Unauthorized access, please login");
  }
});

router.get('/assignment/view', function(req,res){
  if(req.param("id")) res.send("Id not specified");
  if(req.param("classId")) res.send("Class id not specified");
  Classroom.find({_id: req.param("classId")}, function(err, classrooms){
    Homework.find({_id: req.param("id")}, function(err,homework){
      if(err) res.redirect("404");
        res.render('./assignment/id', {homework:homework, user: req.user,
          title: classrooms[0].name,classrooms:classrooms,layout:'/display/layout'});
    });
  });
});
router.get('/assignment/viewall', function(req,res){
  //if(req.param("id")) res.send("Id not specified");
  //if(req.param("classId")) res.send("Class id not specified");
  Classroom.findOne({_id: req.param("id")}, function(err, classrooms){
    Homework.find({class: req.param("id")}, function(err,homework){
      if(err) res.redirect("404");
        res.render('./assignment/viewall', {classId:classrooms._id,homework:homework, user: req.user,
          title: classrooms.name,classrooms:classrooms,layout:'/display/layout'});
    });
  });
});

router.get('/assignment/create', function(req,res){
  // if(req.param("id"))
  if(!req.param("id")) res.send("You did not specify a classroomt to post to!");
  Classroom.find({_id: req.param("id")}, function(err, classrooms){
    if(err){
      res.send("Incorrect id specified");
    }
    //if(err) throw err;
    var error = false;
    //if theres a message in the session, its probably an error!
    //console.log(req.session.msg);
    if(req.session.msg) error = true;
    //reset session msg
    var err = req.session.msg;
    req.session.msg = "";
    res.render('./assignment/create', {classId:req.param("id"),user: req.user, title: "Create an assignment",
    classrooms:classrooms,error:error,err:err});

  });

});

router.post('/assignment/create', function(req,res){
  //assignment_name, assignment_date, assignment_description
  // create a new user
  if(req.body.assignment_name){
    var newHomework= Homework({
      name: req.body.assignment_name ,
      date: req.body.assignment_date,
      class: req.param("id"),
      description:req.body.assignment_description,
      posted: new Date().toJSON().slice(0,10),
      moderators: req.user
    });
    newHomework.save(function(err) {
      if (err){
        console.log("Could not create classroom"+err+"1");
        req.session.msg = err;
        res.redirect("/assignment/create");
      } //throw err;
      else{
        //console.log("success!")
        res.redirect('/classroom/display');
      }

    });
  }
});




/************************************
  CLASSROOM ROUTES BELOW
**************************************/

router.get('/classroom/create', function(req,res){
  Classroom.find({}, function(err, classrooms){
    //if(err) throw err;
    var error = false;
    //if theres a message in the session, its probably an error!
    console.log(req.session.msg);
    if(req.session.msg) error = true;
    //reset session msg
    var err = req.session.msg;
    req.session.msg = "";

    //console.log(req.user);
    res.render('./classroom/create', {user: req.user, title: "Create a classroom",classrooms:classrooms,error:error,err:err});
    // res.render('image-post', {imageposts:imageposts});
  });

});

router.get('/classroom/display', function(req,res){
  Classroom.find({}, function(err, classrooms){
    if(err) throw err;

    console.log(req.user);
    res.render('./classroom/display', {user: req.user, title: "Display list of classrooms",classrooms:classrooms,
    });
    // res.render('image-post', {imageposts:imageposts});
  });

});

router.get('/classroom/enroll', function(req,res){
  if(!req.param("class")){
    res.send("Error: class not specified");
  }
  //if ur logged in
  if(req.user){
    Classroom.findOneAndUpdate({_id:req.param("class")}, {$push: {students: req.user}}, function(err, classroom, count){
      if(err) throw err;
      res.redirect('/classroom/display');
    });
  }
  });


router.get('/display/my_classes',function(req,res){
  if(req.user){
    Classroom.find({students:{$elemMatch:{"username":req.user.username}}}, function(err, classrooms){
      if(err){ res.send(err);}
      //determine if the user is enrolled in a class
      var is_enrolled = true;
      if(!classrooms.length) is_enrolled = false;
      console.log(classrooms.length);
      //console.log(classrooms)
      res.render('./display/my_classes', {user:req.user, classrooms:classrooms,is_enrolled:is_enrolled});
    });

  }
  else{
    res.redirect('/login');
  }

});


router.get('/classroom/id', function(req,res){
  //console.log("Req.param",req.param("class"));

  if(!req.param("class")){res.send("Error: Class not specified");}



  Classroom.find({_id:req.param("class")}, function(err, classrooms){
    if(err){
      res.send("Classroom specified in id cannot be found!");
    }
    //if user is logged in, check if there the adminstrator
    if(req.user){
      var is_admin = false;
      //if the user is moderator, specify flag
      if(classrooms[0].moderators.username == req.user.username)
        is_admin = true;

        Classroom.find({_id:req.param("class")},
        {students:{$elemMatch:{"username":req.user.username}}}, function(err,class_enrolled){
          var allow_enroll  = false;

          if(err || class_enrolled[0].students.length==0) allow_enroll= true;

          //pass in class id so we can enroll
          var classId = classrooms[0]._id;
          res.render('./classroom/id', {is_admin:is_admin,user: req.user, allow_enroll:allow_enroll,
            classId:classId,title: classrooms[0].name,classrooms:classrooms,layout:'/display/layout'});
        });


    }
    else{
      res.render('./classroom/id', {is_admin:false,user: req.user, title: classrooms[0].name,classrooms:classrooms,layout:'/display/layout'});
    }

    // res.render('image-post', {imageposts:imageposts});
  });

});

router.post('/classroom/create', function(req,res){

  // create a new user
  if(req.body.classroom_name){
    var newClassroom = Classroom({
      name: req.body.classroom_name,
      description: req.body.classroom_description,
      moderators: req.user
    });

    newClassroom.save(function(err) {
      if (err){
        console.log("Could not create classroom"+err+"1");
        req.session.msg = err;
        res.redirect("/classroom/create");
      } //throw err;
      else{
        res.redirect('/classroom/display');
      }

    });
  }


});


/************************************
  USER ACCOUNT INFORMATION ROUTES BELOW
**************************************/

router.get('/register', function(req,res){
  res.render('register');
});

router.post('/register', function(req, res, next) {
  console.log('registering user');
  Account.register(new Account({username:     req.body.username,
                                first_name:   req.body.first_name,
                                last_name:    req.body.last_name,
                                email:        req.body.email}), req.body.password,
  function(err) {
    if (err) {
      console.log('error while user register!', err.name);
      // res.status(400);
      // next(err);
      res.render('register', {error:true,err:err});
      // return next(err);
    }
    else{
      //res.render('index',{msg:"Congratulations you have successfully registered, please login"});
      req.session.msg = "Congratulations you have successfully registered, please login";
      res.redirect('/')
    }
  });


});

router.get('/login', function(req, res) {
  //check to see if incorrect user/pass entered
  var err_msg =false;
  if(req.query.failure){
    err_msg = true;
  }
  res.render('login', {user: req.user, err_msg:err_msg});
});

// router.post('/login', passport.authenticate('local'), function(req, res) {
//   res.redirect('/');
// });
router.post('/login', passport.authenticate('local', { layout:'',
                                                       successRedirect: '/',
                                                       failureRedirect: '/login?failure=true',
                                                       failureFlash: "login failed!",
                                                       successFlash: "login successful!"}));

router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

module.exports = router;
