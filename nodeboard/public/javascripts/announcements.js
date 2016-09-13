
document.addEventListener("DOMContentLoaded", function(event) {

  document.getElementsByTagName("button")[0].addEventListener('click', function(event){

    var classId = document.getElementById("classId");
    var username = document.getElementById("username");
    console.log(username.getAttribute("value"))

    event.preventDefault(); //prevent submission before we check email
    var req = new XMLHttpRequest();
    req.open("POST","/api/announcements",true);
    req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    req.send("id="+classId.getAttribute("value")+"&"+"username=");
    var myForm = document.getElementById("myForm").submit();
    //if(req){}
    //validate email and make sure we dont keep appending
    // if(!validateEmail(email.value) && document.getElementById("err_msg").innerHTML == ""){
    //   var msg = document.createElement("div");
    //   msg.setAttribute("class","alert alert-danger")
    //   msg.setAttribute("id","alert");
    //   msg.innerHTML = "Please enter a proper email address";
    //   document.getElementById("err_msg").appendChild(msg);
    // }
    // //when validate email is okay, we can get rid of err_msg
    // if(validateEmail(email.value)){
    //   var err_msg  = document.getElementById("err_msg");
    //   var alertDiv = document.getElementById("alert");
    //   err_msg.remove(alertDiv);
    //     var myForm = document.getElementById("myForm");
    //     console.log(myForm);
    //     myForm.submit();
    // }

  });


});

//validates an email using regular expression to indetify if a period and @ symbol
function validateEmail(email)
{
    var re = /\S+@\S+\.\S+/;
    return re.test(email);
}
