import {
 auth,
 db
}
from "./firebase.js";

import {
 signOut,
 onAuthStateChanged
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
 doc,
 getDoc
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let currentUserData;

onAuthStateChanged(
 auth,
 async(user)=>{

 if(user){

  const ref =
  doc(db,"users",user.uid);

  const snap =
  await getDoc(ref);

  currentUserData =
  snap.data();

  document.getElementById(
  "chatUsername"
  ).innerHTML =
  currentUserData.username +

  (
   currentUserData.verified
   ?
   `<span class='verified'>
    ✔
   </span>`
   :
   ""
  ) +

  (
   currentUserData.admin
   ?
   `<span class='admin-badge'>
    ADMIN
   </span>`
   :
   ""
  );

 }else{

  location.href =
  "index.html";
 }
});

window.logout =
async function(){

 await signOut(auth);

 location.href =
 "index.html";
}

window.openSettings =
function(){

 document.getElementById(
 "settingsPopup"
 ).style.display =
 "flex";
}

window.addContact =
function(){

 const code =
 prompt(
 "Masukkan kode kontak"
 );

 alert(
 "Fitur add contact realtime akan dibuat di tahap berikutnya"
 );
}

window.createGroup =
function(){

 alert(
 "Fitur grup coming soon"
 );
}

window.openProfile =
function(){

 alert(
 "Fitur profile coming soon"
 );
}

window.sendMessage =
function(){

 const input =
 document.getElementById(
 "messageInput"
 );

 if(input.value === ""){
  return;
 }

 const div =
 document.createElement("div");

 div.className =
 "message";

 div.innerText =
 input.value;

 document.getElementById(
 "messages"
 ).appendChild(div);

 input.value = "";
}