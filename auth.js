import {
 auth,
 db
}
from "./firebase.js";

import {
 createUserWithEmailAndPassword,
 signInWithEmailAndPassword
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
 doc,
 setDoc
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

function randomCode(){

 return Math.random()
 .toString(36)
 .substring(2,10)
 + "@"
 + Math.floor(
 Math.random()*9999
 );
}

window.register =
async function(){

 const username =
 document.getElementById(
 "username"
 ).value;

 const email =
 document.getElementById(
 "email"
 ).value;

 const password =
 document.getElementById(
 "password"
 ).value;

 try{

  const userCredential =
  await createUserWithEmailAndPassword(
   auth,
   email,
   password
  );

  await setDoc(
   doc(
    db,
    "users",
    userCredential.user.uid
   ),
   {
    username,
    email,
    contactCode:
    randomCode(),

    admin:false,

    verified:false,

    banned:false,

    suspended:false
   }
  );

  alert("Register berhasil");

  location.href =
  "index.html";

 }catch(err){

  alert(err.message);
 }
}

window.login =
async function(){

 const email =
 document.getElementById(
 "email"
 ).value;

 const password =
 document.getElementById(
 "password"
 ).value;

 try{

  await signInWithEmailAndPassword(
   auth,
   email,
   password
  );

  location.href =
  "app.html";

 }catch(err){

  alert(
   "Email atau password salah"
  );
 }
}