import {
 db
}
from "./firebase.js";

import {
 doc,
 updateDoc,
 deleteDoc
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

window.banUser =
async function(uid){

 await updateDoc(
  doc(db,"users",uid),
  {
   banned:true
  }
 );

 alert("User berhasil di ban");
}

window.suspendUser =
async function(uid,days){

 const suspendUntil =
 Date.now() +
 (days * 86400000);

 await updateDoc(
  doc(db,"users",uid),
  {
   suspended:true,
   suspendUntil
  }
 );

 alert(
  "User di suspend "
  + days +
  " hari"
 );
}

window.deleteUserAccount =
async function(uid){

 await deleteDoc(
  doc(db,"users",uid)
 );

 alert(
  "Akun berhasil dihapus"
 );
}

window.giveVerified =
async function(uid){

 await updateDoc(
  doc(db,"users",uid),
  {
   verified:true
  }
 );

 alert(
  "Centang biru diberikan"
 );
}

window.removeVerified =
async function(uid){

 await updateDoc(
  doc(db,"users",uid),
  {
   verified:false
  }
 );

 alert(
  "Centang biru dihapus"
 );
}

window.makeAdmin =
async function(uid){

 await updateDoc(
  doc(db,"users",uid),
  {
   admin:true,
   verified:true
  }
 );

 alert(
  "User sekarang admin"
 );
}

window.removeAdmin =
async function(uid){

 await updateDoc(
  doc(db,"users",uid),
  {
   admin:false
  }
 );

 alert(
  "Role admin dihapus"
 );
}

window.changeContactCode =
async function(uid,newCode){

 await updateDoc(
  doc(db,"users",uid),
  {
   contactCode:newCode
  }
 );

 alert(
  "Kode kontak diubah"
 );
}

window.sendAnnouncement =
async function(text){

 await updateDoc(
  doc(db,"system","announcement"),
  {
   text,
   createdAt:
   Date.now()
  }
 );

 alert(
  "Announcement berhasil dikirim"
 );
}