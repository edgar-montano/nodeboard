
document.addEventListener("DOMContentLoaded", function(event) {

  document.getElementById("btnSubmit").addEventListener('click', function(event){
    var email = document.getElementById("email");
    event.preventDefault(); //prevent submission before we check email
    //validate email and make sure we dont keep appending
    if(!validateEmail(email.value) && document.getElementById("err_msg").innerHTML == ""){
      var msg = document.createElement("div");
      msg.setAttribute("class","alert alert-danger")
      msg.setAttribute("id","alert");
      msg.innerHTML = "Please enter a proper email address";
      document.getElementById("err_msg").appendChild(msg);
    }
    //when validate email is okay, we can get rid of err_msg
    if(validateEmail(email.value)){
      var err_msg  = document.getElementById("err_msg");
      var alertDiv = document.getElementById("alert");
      err_msg.remove(alertDiv);
        var myForm = document.getElementById("myForm");
        console.log(myForm);
        myForm.submit();
    }

  });

  // if(err_msg.getAttribute("err") == "true"){
  //   var msg = document.createElement("div");
  //   msg.setAttribute("class","alert alert-danger")
  //   msg.innerHTML = "Wrong username or password, please try again";
  //   err_msg.appendChild(msg);
  // }


});

//validates an email using regular expression to indetify if a period and @ symbol
function validateEmail(email)
{
    var re = /\S+@\S+\.\S+/;
    return re.test(email);
}
