// ===== 1. LANDING + README LOAD =====
function loadReadme(){
  fetch('README.md')
 .then(res => {
    if(!res.ok) throw new Error('README not found');
    return res.text();
  })
 .then(text => {
    document.getElementById('readmeContent').innerHTML = marked.parse(text);
  })
 .catch(err => {
    document.getElementById('readmeContent').innerHTML = '<p style="text-align:center">Please add a <code>README.md</code> file to your GitHub repo to show it here.</p>';
  });
}

function showAuth(){
  document.getElementById('landingPage').style.display='none';
  document.getElementById('authScreen').style.display='flex';
}

function showLanding(){
  document.getElementById('authScreen').style.display='none';
  document.getElementById('landingPage').style.display='flex';
}

function showSignup(){
  document.getElementById('loginForm').style.display='none';
  document.getElementById('signupForm').style.display='block';
}

function showLogin(){
  document.getElementById('signupForm').style.display='none';
  document.getElementById('loginForm').style.display='block';
}

function checkAuth(){
  if(localStorage.getItem('moLoggedIn')==='true'){
    document.getElementById('landingPage').style.display='none';
    document.getElementById('authScreen').style.display='none';
    document.getElementById('appScreen').style.display='flex';
    initApp();
  } else {
    document.getElementById('landingPage').style.display='flex';
    document.getElementById('authScreen').style.display='none';
    document.getElementById('appScreen').style.display='none';
    loadReadme(); // Load README on landing
  }
}

function handleSignup(e){
  e.preventDefault();
  const name=document.getElementById('signupName').value.trim();
  const phone=document.getElementById('signupPhone').value.trim();
  const pass=document.getElementById('signupPass').value;
  if(!name ||!phone ||!pass){ alert('Please fill all fields'); return; }
  let users=JSON.parse(localStorage.getItem('moUsers')||'[]');
  if(users.find(u=>u.phone===phone)){alert('Phone number already registered');return;}
  users.push({name,phone,pass});
  localStorage.setItem('moUsers',JSON.stringify(users));
  localStorage.setItem('moLoggedIn','true');
  localStorage.setItem('moUser',phone);
  localStorage.setItem('moName',name);
  alert('Account Created Successfully!');
  checkAuth();
}

function handleLogin(e){
  e.preventDefault();
  const user=document.getElementById('loginUser').value.trim();
  const pass=document.getElementById('loginPass').value;
  let users=JSON.parse(localStorage.getItem('moUsers')||'[]');
  const found=users.find(u=>(u.phone===user||u.name===user)&&u.pass===pass);
  if(found){
    localStorage.setItem('moLoggedIn','true');
    localStorage.setItem('moUser',found.phone);
    localStorage.setItem('moName',found.name);
    alert('Login Successful!');
    checkAuth();
  }else{alert('Invalid phone/email or password');}
}

function logout(){
  localStorage.removeItem('moLoggedIn');
  document.getElementById('appScreen').style.display='none';
  showLanding();
}

// ===== 2. DATA STORAGE =====
function getContacts(){return JSON.parse(localStorage.getItem('moContacts_'+localStorage.getItem('moUser'))||'[]');}
function getChats(){return JSON.parse(localStorage.getItem('moChats_'+localStorage.getItem('moUser'))||'[]');}
function saveContacts(c){localStorage.setItem('moContacts_'+localStorage.getItem('moUser'),JSON.stringify(c));}
function saveChats(c){localStorage.setItem('moChats_'+localStorage.getItem('moUser'),JSON.stringify(c));}
let currentChat=null;

// ===== 3. APP INIT =====
function initApp(){
  loadContacts();
  loadChats();

  // Load Dark Mode
  if(localStorage.getItem('moDark')==='true'){
    document.body.classList.add('dark');
    const dm = document.getElementById('darkMode');
    if(dm) dm.checked=true;
  }

  // Load Animations
  if(localStorage.getItem('moAnim')==='true'){
    const anim = document.getElementById('animations');
    if(anim) anim.checked=true;
  }

  const user=localStorage.getItem('moUser');
  const name=localStorage.getItem('moName');
  if(document.getElementById('setContact')) document.getElementById('setContact').value=user;
  if(document.getElementById('accContact')) document.getElementById('accContact').value=user;
  if(document.getElementById('contact')) document.getElementById('contact').value=user;
  if(document.getElementById('accFullName')) document.getElementById('accFullName').value=name;
  if(document.getElementById('fullName')) document.getElementById('fullName').value=name;

  loadProfileData();
}

// ===== 4. CONTACTS =====
function addContact(){
  const name=prompt('Enter contact name:');
  if(!name)return;
  const phone=prompt('Enter contact phone:');
  if(!phone)return;
  let contacts=getContacts();
  if(contacts.find(c=>c.phone===phone)){alert('Contact already exists');return;}
  contacts.push({id:Date.now(),name,phone});
  saveContacts(contacts);
  loadContacts();
}

function loadContacts(){
  const list=document.getElementById('contactList');
  if(!list) return;
  const contacts=getContacts();
  list.innerHTML=contacts.length?contacts.map(c=>`<div class="contact-item" onclick="startChat(${c.id},'${c.name}')"><div class="avatar">${c.name[0].toUpperCase()}</div><div class="info"><div class="name">${c.name}</div><div class="last">${c.phone}</div></div></div>`).join(''):'<p style="text-align:center;padding:20px;color:var(--text-secondary)">No contacts. Tap Add Contact</p>';
}

// ===== 5. CHATS =====
function loadChats(filter='all'){
  const list=document.getElementById('chatList');
  if(!list) return;
  const chats=getChats().filter(c=>filter==='all'||c.type===filter);
  list.innerHTML=chats.length?chats.map(c=>`<div class="chat-item" onclick="openChat(${c.id},'${c.name}')"><div class="avatar">${c.avatar}</div><div class="info"><div class="name">${c.name}</div><div class="last">${c.last||'Tap to chat'}</div></div><div class="time">${c.time||''}</div></div>`).join(''):'<p style="text-align:center;padding:20px;color:var(--text-secondary)">No chats yet. Add a contact to start</p>';
}

function startChat(id,name){
  let chats=getChats();
  if(!chats.find(c=>c.id===id)){chats.push({id,name,last:"",time:"Now",avatar:name[0].toUpperCase(),type:"all"});saveChats(chats);}
  openChat(id,name);
  showPage('chatsPage',document.querySelectorAll('.nav-item')[0]);
}

function filterChats(type,el){
  document.querySelectorAll('#chatsPage.tab').forEach(t=>t.classList.remove('active'));
  el.classList.add('active');
  loadChats(type);
}

// ===== 6. CHAT WINDOW =====
function openChat(id,name){
  currentChat=id;
  document.getElementById('chatWindow').style.display='flex';
  document.getElementById('chatName').textContent=name;
  document.getElementById('chatAvatar').textContent=name[0].toUpperCase();
  document.getElementById('callAvatar').textContent=name[0].toUpperCase();
  const msgs=JSON.parse(localStorage.getItem('chat_'+localStorage.getItem('moUser')+'_'+id)||'[]');
  document.getElementById('chatMessages').innerHTML=msgs.map(m=>`<div class="msg ${m.sender}">${m.text}</div>`).join('');
  document.getElementById('chatMessages').scrollTop=99999;
}

function closeChat(){document.getElementById('chatWindow').style.display='none';}

function sendMessage(){
  const input=document.getElementById('messageInput');
  if(!input.value.trim())return;
  const key='chat_'+localStorage.getItem('moUser')+'_'+currentChat;
  const msgs=JSON.parse(localStorage.getItem(key)||'[]');
  msgs.push({sender:'me',text:input.value,time:new Date().toLocaleTimeString()});
  localStorage.setItem(key,JSON.stringify(msgs));

  let chats=getChats();
  let chat=chats.find(c=>c.id===currentChat);
  if(chat){chat.last=input.value;chat.time="Now";saveChats(chats);loadChats();}

  openChat(currentChat,chat.name);
  input.value="";
}

// ===== 7. CALLS =====
function startCall(type){
  document.getElementById('callModal').style.display='flex';
  document.getElementById('callType').textContent=type==='audio'?'Audio Calling...':'Video Calling...';
}
function endCall(){document.getElementById('callModal').style.display='none';alert('Call Ended');}

// ===== 8. SETTINGS =====
function showSettingsTab(id,el){
  document.querySelectorAll('#settingsPage.subpage').forEach(s=>s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  document.querySelectorAll('.settings-tabs-vertical.tab').forEach(t=>t.classList.remove('active'));
  el.classList.add('active');
}

function saveSettingsAccount(e){
  e.preventDefault();
  const data={
    contact: document.getElementById('setContact').value,
    username: document.getElementById('setUsername').value,
    bio: document.getElementById('setBio').value
  };
  localStorage.setItem('moProfileAccount_'+localStorage.getItem('moUser'),JSON.stringify(data));
  alert('Account Settings Saved!');
}

function toggleAnim(el){
  localStorage.setItem('moAnim',el.checked);
}

function toggleDark(el){
  document.body.classList.toggle('dark',el.checked);
  localStorage.setItem('moDark',el.checked);
}

function changeLanguage(l){
  localStorage.setItem('moLang',l);
  alert('Language set to: '+l);
}

// ===== 9. PROFILE =====
function showProfileTab(id,el){
  document.querySelectorAll('#profilePage.subpage').forEach(s=>s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  document.querySelectorAll('#profilePage.tab').forEach(t=>t.classList.remove('active'));
  el.classList.add('active');
}

function previewPhoto(e){
  const f=e.target.files[0];
  if(f){
    const r=new FileReader();
    r.onload=ev=>{
      document.getElementById('profilePreview').src=ev.target.result;
      document.getElementById('profilePreview').style.display='block';
      localStorage.setItem('moProfilePic_'+localStorage.getItem('moUser'),ev.target.result);
    };
    r.readAsDataURL(f);
  }
}

function savePersonal(e){
  e.preventDefault();
  const data={
    fullName: document.getElementById('fullName').value,
    contact: document.getElementById('contact').value,
    gender: document.getElementById('gender').value,
    dob: document.getElementById('dob').value,
    marital: document.getElementById('marital').value,
    nationality: document.getElementById('nationality').value
  };
  localStorage.setItem('moProfilePersonal_'+localStorage.getItem('moUser'),JSON.stringify(data));
  alert('Personal Details Saved!');
}

function saveAccount(e){
  e.preventDefault();
  const data={
    fullName: document.getElementById('accFullName').value,
    contact: document.getElementById('accContact').value,
    username: document.getElementById('username').value,
    bio: document.getElementById('bio').value
  };
  localStorage.setItem('moProfileAccount_'+localStorage.getItem('moUser'),JSON.stringify(data));
  alert('Account Updated!');
}

function changePassword(e){
  e.preventDefault();
  const oldPass=document.getElementById('oldPass').value;
  const newPass=document.getElementById('newPass').value;
  const confirmPass=document.getElementById('confirmPass').value;

  let users=JSON.parse(localStorage.getItem('moUsers')||'[]');
  const phone=localStorage.getItem('moUser');
  const userIndex=users.findIndex(u=>u.phone===phone);

  if(userIndex===-1)return alert('User not found');
  if(users[userIndex].pass!==oldPass)return alert('Old password is incorrect');
  if(newPass!==confirmPass)return alert('New passwords do not match');

  users[userIndex].pass=newPass;
  localStorage.setItem('moUsers',JSON.stringify(users));
  alert('Password Changed Successfully!');
  e.target.reset();
}

// ===== 10. NAVIGATION =====
function showPage(id,el){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  el.classList.add('active');
}

function search(val){
  console.log("Searching:",val);
}

// ===== 11. LOAD PROFILE DATA =====
function loadProfileData(){
  const user=localStorage.getItem('moUser');

  // Load Personal
  const personal=JSON.parse(localStorage.getItem('moProfilePersonal_'+user)||'{}');
  Object.keys(personal).forEach(k=>{
    const el=document.getElementById(k);
    if(el) el.value=personal[k];
  });

  // Load Account
  const account=JSON.parse(localStorage.getItem('moProfileAccount_'+user)||'{}');
  Object.keys(account).forEach(k=>{
    let id='acc'+k.charAt(0).toUpperCase()+k.slice(1);
    const el=document.getElementById(id);
    if(el) el.value=account[k];
    if(k==='contact' && document.getElementById('setContact'))
      document.getElementById('setContact').value=account[k];
    if(k==='username' && document.getElementById('setUsername'))
      document.getElementById('setUsername').value=account[k];
    if(k==='bio' && document.getElementById('setBio'))
      document.getElementById('setBio').value=account[k];
  });

  // Load Profile Pic
  const pic=localStorage.getItem('moProfilePic_'+user);
  if(pic){
    const img=document.getElementById('profilePreview');
    if(img){img.src=pic;img.style.display='block';}
  }
}

// ===== 12. START =====
window.onload=checkAuth;