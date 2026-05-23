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
 setDoc,
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

let activeChat = "global";

let activeChatName = "Global Chat";

function encrypt(text){

 return btoa(text);
}

function decrypt(text){

 return atob(text);
}

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

  if(currentUserData.banned){

   alert("Akun dibanned");

   await signOut(auth);

   location.href =
   "index.html";

   return;
  }

  if(currentUserData.suspended){

   if(
    Date.now() <
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

  loadMessages();

  loadContacts();

  loadAnnouncement();

 }else{

  location.href =
  "index.html";
 }
});

function encrypt(text){

 return btoa(text);
}

function decrypt(text){

 return atob(text);
}

function loadMessages(){

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

  orderBy("createdAt")
 );

 onSnapshot(q,(snapshot)=>{

  const messages =
  document.getElementById(
  "messages"
  );

  messages.innerHTML = "";

  snapshot.forEach(docSnap=>{

   const data =
   docSnap.data();

   const div =
   document.createElement("div");

   div.className =
   "message";

   div.innerHTML =

   `<b>${data.username}</b><br>

   ${decrypt(data.text)}

   <br><br>

   <button onclick="deleteMessage('${docSnap.id}')">
   Hapus
   </button>`;

   messages.appendChild(div);
  });

  messages.scrollTop =
  messages.scrollHeight;
 });
}

window.sendMessage =
async function(){

 const input =
 document.getElementById(
 "messageInput"
 );

 if(input.value === ""){
  return;
 }

 await addDoc(

  collection(
   db,
   "messages"
  ),

  {
   chatId:activeChat,

   text:
   encrypt(input.value),

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

window.deleteMessage =
async function(id){

 await deleteDoc(
  doc(db,"messages",id)
 );
}

window.openGlobalChat =
function(){

 activeChat =
 "global";

 activeChatName =
 "Global Chat";

 document.getElementById(
 "chatUsername"
 ).innerText =
 activeChatName;

 loadMessages();
}

async function loadContacts(){

 const q = query(
  collection(db,"users")
 );

 const snap =
 await getDocs(q);

 const list =
 document.getElementById(
 "chatList"
 );

 list.innerHTML =

 `
 <div class="chat-item"
 onclick="openGlobalChat()">

 🌍 Global Chat

 </div>
 `;

 snap.forEach(docSnap=>{

  const data =
  docSnap.data();

  if(
   data.contactCode ===
   currentUserData.contactCode
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

   activeChatName =
   data.username;

   document.getElementById(
   "chatUsername"
   ).innerText =
   activeChatName;

   loadMessages();
  };

  list.appendChild(div);
 });
}

function createPrivateChatId(a,b){

 return [a,b]
 .sort()
 .join("_");
}

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

window.createGroup =
async function(){

 const name =
 prompt(
  "Nama grup"
 );

 if(!name){
  return;
 }

 await addDoc(

  collection(
   db,
   "groups"
  ),

  {
   name,

   owner:
   auth.currentUser.uid,

   createdAt:
   serverTimestamp()
  }
 );

 alert(
  "Grup berhasil dibuat"
 );
}

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

 "Kode Kontak: "
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
   username:newUsername
  }
 );

 alert(
  "Username berhasil diubah"
 );

 location.reload();
}

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