import {
 auth,
 db
}
from "./firebase.js";

import {
 signOut,
 onAuthStateChanged,
 updatePassword
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
 doc,
 getDoc,
 updateDoc,
 deleteDoc,
 collection,
 addDoc,
 onSnapshot,
 query,
 orderBy,
 serverTimestamp,
 where,
 getDocs
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let currentUserData;

let activeChat = null;

let unsubscribeMessages = null;

/* =========================
   ENCRYPTION
========================= */

function encrypt(text){

 return btoa(text);
}

function decrypt(text){

 try{

  return atob(text);

 }catch{

  return text;
 }
}

/* =========================
   AUTH
========================= */

onAuthStateChanged(
 auth,
 async(user)=>{

 if(user){

  const ref =
  doc(
   db,
   "users",
   user.uid
  );

  const snap =
  await getDoc(ref);

  currentUserData =
  snap.data();

  /* BANNED */

  if(currentUserData.banned){

   alert("Akun dibanned");

   await signOut(auth);

   location.href =
   "index.html";

   return;
  }

  /* SUSPEND */

  if(
   currentUserData.suspended
  ){

   if(
    Date.now()
    <
    currentUserData.suspendUntil
   ){

    alert(
     "Akun sedang disuspend"
    );

    await signOut(auth);

    location.href =
    "index.html";

    return;
   }
  }

  document.getElementById(
  "chatUsername"
  ).innerHTML =

  currentUserData.username +

  (
   currentUserData.verified
   ?
   " ✔"
   :
   ""
  ) +

  (
   currentUserData.admin
   ?
   " ADMIN"
   :
   ""
  );

  loadContacts();

  loadAnnouncement();

 }else{

  location.href =
  "index.html";
 }
});

/* =========================
   LOAD CONTACTS
========================= */

async function loadContacts(){

 const q =
 query(
  collection(db,"users")
 );

 const snap =
 await getDocs(q);

 const list =
 document.getElementById(
 "chatList"
 );

 list.innerHTML = "";

 snap.forEach(docSnap=>{

  const data =
  docSnap.data();

  if(
   docSnap.id ===
   auth.currentUser.uid
  ){
   return;
  }

  const div =
  document.createElement("div");

  div.className =
  "chat-item";

  div.innerHTML =

  data.username +

  (
   data.verified
   ?
   " ✔"
   :
   ""
  ) +

  (
   data.admin
   ?
   " ADMIN"
   :
   ""
  );

  div.onclick = ()=>{

   activeChat =
   createPrivateChatId(
    auth.currentUser.uid,
    docSnap.id
   );

   document.getElementById(
   "chatUsername"
   ).innerHTML =

   data.username +

   (
    data.verified
    ?
    " ✔"
    :
    ""
   ) +

   (
    data.admin
    ?
    " ADMIN"
    :
    ""
   );

   loadMessages();
  };

  list.appendChild(div);
 });
}

/* =========================
   PRIVATE CHAT ID
========================= */

function createPrivateChatId(a,b){

 return [a,b]
 .sort()
 .join("_");
}

/* =========================
   LOAD MESSAGES
========================= */

function loadMessages(){

 if(!activeChat){
  return;
 }

 if(unsubscribeMessages){

  unsubscribeMessages();
 }

 const q = query(

  collection(
   db,
   "messages"
  ),

  where(
   "chatId",
   "==",
   activeChat
  ),

  orderBy(
   "createdAt",
   "asc"
  )
 );

 unsubscribeMessages =
 onSnapshot(q,(snapshot)=>{

  const messages =
  document.getElementById(
  "messages"
  );

  messages.innerHTML = "";

  snapshot.forEach(docSnap=>{

   const data =
   docSnap.data();

   if(!data.createdAt){
    return;
   }

   const div =
   document.createElement("div");

   div.className =
   "message";

   div.innerHTML =

   `
   <b>${data.username}</b>

   <br>

   ${decrypt(data.text)}

   <br><br>

   <button
   onclick="deleteMessage('${docSnap.id}')">

   Hapus

   </button>
   `;

   messages.appendChild(div);
  });

  messages.scrollTop =
  messages.scrollHeight;
 });
}

/* =========================
   SEND MESSAGE
========================= */

window.sendMessage =
async function(){

 if(!activeChat){

  alert(
   "Pilih chat terlebih dahulu"
  );

  return;
 }

 const input =
 document.getElementById(
 "messageInput"
 );

 const text =
 input.value.trim();

 if(text === ""){
  return;
 }

 await addDoc(

  collection(
   db,
   "messages"
  ),

  {
   chatId:
   activeChat,

   text:
   encrypt(text),

   username:
   currentUserData.username,

   uid:
   auth.currentUser.uid,

   createdAt:
   serverTimestamp()
  }
 );

 input.value = "";
}

/* =========================
   DELETE MESSAGE
========================= */

window.deleteMessage =
async function(id){

 await deleteDoc(
  doc(
   db,
   "messages",
   id
  )
 );
}

/* =========================
   ADD CONTACT
========================= */

window.addContact =
async function(){

 const code =
 prompt(
 "Masukkan kode kontak"
 );

 if(!code){
  return;
 }

 const q = query(

  collection(db,"users"),

  where(
   "contactCode",
   "==",
   code
  )
 );

 const snap =
 await getDocs(q);

 if(snap.empty){

  alert(
   "Kode kontak tidak ditemukan"
  );

  return;
 }

 alert(
  "Kontak berhasil ditambahkan"
 );

 loadContacts();
}

/* =========================
   CREATE GROUP
========================= */

window.createGroup =
async function(){

 const name =
 prompt(
  "Nama grup"
 );

 if(!name){
  return;
 }

 const groupId =
 "group_" +
 Date.now();

 const div =
 document.createElement("div");

 div.className =
 "chat-item";

 div.innerHTML =
 "👥 " + name;

 div.onclick = ()=>{

  activeChat =
  groupId;

  document.getElementById(
  "chatUsername"
  ).innerText =
  name;

  loadMessages();
 };

 document.getElementById(
 "chatList"
 ).appendChild(div);

 alert(
  "Grup berhasil dibuat"
 );
}

/* =========================
   ANNOUNCEMENT
========================= */

function loadAnnouncement(){

 onSnapshot(

  doc(
   db,
   "system",
   "announcement"
  ),

  (snap)=>{

   if(snap.exists()){

    document.getElementById(
    "announcementBar"
    ).innerText =

    snap.data().text;
   }
  }
 );
}

/* =========================
   PROFILE
========================= */

window.openProfile =
function(){

 document.getElementById(
 "profilePopup"
 ).style.display =
 "flex";

 document.getElementById(
 "profileUsername"
 ).innerText =

 "Username: "
 + currentUserData.username;

 document.getElementById(
 "profileCode"
 ).innerText =

 "Kode Kontak Saya: "
 + currentUserData.contactCode;

 document.getElementById(
 "profileRole"
 ).innerText =

 currentUserData.admin
 ?
 "Role: ADMIN"
 :
 "Role: USER";
}

window.closeProfile =
function(){

 document.getElementById(
 "profilePopup"
 ).style.display =
 "none";
}

window.copyContactCode =
function(){

 navigator.clipboard.writeText(
  currentUserData.contactCode
 );

 alert(
  "Kode kontak disalin"
 );
}

/* =========================
   CHANGE USERNAME
========================= */

window.changeUsername =
async function(){

 const newUsername =
 prompt(
  "Username baru"
 );

 if(!newUsername){
  return;
 }

 await updateDoc(

  doc(
   db,
   "users",
   auth.currentUser.uid
  ),

  {
   username:
   newUsername
  }
 );

 alert(
  "Username berhasil diubah"
 );

 location.reload();
}

/* =========================
   CHANGE PASSWORD
========================= */

window.changePassword =
async function(){

 const last =
 currentUserData.lastPasswordChange
 || 0;

 const month =
 2592000000;

 if(
  Date.now() - last <
  month
 ){

  alert(
   "Password hanya bisa diganti 1 bulan sekali"
  );

  return;
 }

 const newPass =
 prompt(
  "Password baru"
 );

 if(!newPass){
  return;
 }

 await updatePassword(
  auth.currentUser,
  newPass
 );

 await updateDoc(

  doc(
   db,
   "users",
   auth.currentUser.uid
  ),

  {
   lastPasswordChange:
   Date.now()
  }
 );

 alert(
  "Password berhasil diubah"
 );
}

/* =========================
   SETTINGS
========================= */

window.openSettings =
function(){

 document.getElementById(
 "settingsPopup"
 ).style.display =
 "flex";
}

window.closeSettings =
function(){

 document.getElementById(
 "settingsPopup"
 ).style.display =
 "none";
}

/* =========================
   LOGOUT
========================= */

window.logout =
async function(){

 await signOut(auth);

 location.href =
 "index.html";
}