const KEY = "mockUsers";

function getUsers(){
  return JSON.parse(localStorage.getItem(KEY) || "[]");
}

function saveUsers(users){
  localStorage.setItem(KEY, JSON.stringify(users));
}

function hash(p){
  return btoa(p);
}

function delay(ms=500){
  return new Promise(r=>setTimeout(r,ms));
}


// LOGIN
export async function mockLogin(email,password){
  await delay();

  const users = getUsers();

  const user = users.find(
    u => u.email === email && u.password === hash(password)
  );

  if(!user) throw new Error("Invalid credentials");

  return {
    user,
    accessToken:"mock-access",
    refreshToken:"mock-refresh"
  };
}


// SIGNUP
export async function mockSignup(data){
  await delay();

  const payload =
    data instanceof FormData
      ? Object.fromEntries(data.entries())
      : data;

  const users = getUsers();

  if(users.some(u=>u.email===payload.email))
    return { success:false, message:"Email exists" };

  const fullName =
    payload.name ||
    `${payload.first_name || ""} ${payload.last_name || ""}`.trim() ||
    "User";

  const newUser = {
    uid: crypto.randomUUID(),
    email: payload.email,
    password: hash(payload.password),

    // ✅ normalized fields
    name: fullName,
    firstName: payload.first_name || "",
    lastName: payload.last_name || "",
    phone: payload.phone || "",
    role: payload.role || "buyer",

    createdAt: new Date().toISOString()
  };

  saveUsers([...users,newUser]);

  return {
    success:true,
    user:newUser,
    accessToken:"mock-access",
    refreshToken:"mock-refresh"
  };
}


// LOGOUT
export async function mockLogout(){
  await delay();
  return true;
}
