const KEY = "mockUsers";

/* STORAGE */
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

/* UTILS */
const hash = p => btoa(p);
const delay = (ms=400)=>new Promise(r=>setTimeout(r,ms));

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

/* LOGIN */
export async function mockLogin(email,password){
  await delay();

  const user = getUsers().find(
    u => u.email===email && u.password===hash(password)
  );

  if(!user) throw new Error("Invalid credentials");

  return {
    user: normalizeUser(user),
    accessToken:"mock-access",
    refreshToken:"mock-refresh"
  };
}

/* SIGNUP */
export async function mockSignup(data){
  await delay();

  const payload =
    data instanceof FormData
      ? Object.fromEntries(data.entries())
      : data;

  const users = getUsers();

  if(users.some(u=>u.email===payload.email))
    return { success:false, message:"Email exists" };

  const newUser = {
    uid: crypto.randomUUID(),
    email: payload.email,
    password: hash(payload.password),

    role: payload.role || "buyer",

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
    user: normalizeUser(newUser),
    accessToken:"mock-access",
    refreshToken:"mock-refresh"
  };
}

/* LOGOUT */
export async function mockLogout(){
  await delay();
  return true;
}

/* UPDATE PROFILE */
export async function mockUpdateProfile(uid, patch){
  await delay();

  const users = getUsers();

  const next = users.map(u=>
    u.uid===uid ? {...u,...patch} : u
  );

  saveUsers(next);

  return normalizeUser(next.find(u=>u.uid===uid));
}
