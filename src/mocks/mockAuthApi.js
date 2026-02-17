const KEY = "mockUsers";

/* -------------------------------------------------- */
/* STORAGE */
/* -------------------------------------------------- */

function getUsers(){
  try{
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  }catch{
    return [];
  }
}

function saveUsers(users){
  localStorage.setItem(KEY, JSON.stringify(users));
}

/* -------------------------------------------------- */
/* UTILS */
/* -------------------------------------------------- */

function hash(p){
  return btoa(p);
}

function delay(ms=400){
  return new Promise(r=>setTimeout(r,ms));
}

function normalizeUser(u){
  return {
    uid: u.uid,
    email: u.email,
    role: u.role || "buyer",
    name:
      u.name ||
      `${u.firstName || ""} ${u.lastName || ""}`.trim() ||
      "User",

    firstName: u.firstName || "",
    lastName: u.lastName || "",
    phone: u.phone || "",
    address: u.address || "",
    lineId: u.lineId || "",

    createdAt: u.createdAt || null
  };
}

/* -------------------------------------------------- */
/* LOGIN */
/* -------------------------------------------------- */

export async function mockLogin(email,password){
  await delay();

  const users = getUsers();

  const user = users.find(
    u => u.email === email && u.password === hash(password)
  );

  if(!user)
    throw new Error("Invalid credentials");

  return {
    user: normalizeUser(user)
  };
}

/* -------------------------------------------------- */
/* SIGNUP */
/* -------------------------------------------------- */

export async function mockSignup(data){
  await delay();

  const payload =
    data instanceof FormData
      ? Object.fromEntries(data.entries())
      : data;

  const users = getUsers();

  if(users.some(u=>u.email===payload.email)){
    return {
      success:false,
      message:"Email already exists"
    };
  }

  if(!payload.email || !payload.password){
    return {
      success:false,
      message:"Missing required fields"
    };
  }

  const newUser = {
    uid: crypto.randomUUID(),

    email: payload.email,
    password: hash(payload.password),

    role: payload.role || "buyer",

    name:
      payload.name ||
      `${payload.first_name || ""} ${payload.last_name || ""}`.trim() ||
      "User",

    firstName: payload.first_name || "",
    lastName: payload.last_name || "",
    phone: payload.phone || "",
    address: payload.address || "",
    lineId: payload.line_id || "",

    createdAt: new Date().toISOString()
  };

  saveUsers([...users,newUser]);

  return {
    success:true,
    user: normalizeUser(newUser)
  };
}

/* -------------------------------------------------- */
/* LOGOUT */
/* -------------------------------------------------- */

export async function mockLogout(){
  await delay();
  return true;
}

/* -------------------------------------------------- */
/* UPDATE PROFILE */
/* -------------------------------------------------- */

export async function mockUpdateProfile(uid, patch){
  await delay();

  const users = getUsers();

  const next = users.map(u=>{
    if(u.uid !== uid) return u;

    return {
      ...u,
      ...patch
    };
  });

  saveUsers(next);

  const updated = next.find(u=>u.uid===uid);

  return normalizeUser(updated);
}
