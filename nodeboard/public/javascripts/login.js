document.addEventListener("DOMContentLoaded", function(event) {
  var err_msg = document.getElementById("err_msg");
  if(err_msg.getAttribute("err") == "true"){
    var msg = document.createElement("div");
    msg.setAttribute("class","alert alert-danger")
    msg.innerHTML = "Wrong username or password, please try again";
    err_msg.appendChild(msg);
  }


});
