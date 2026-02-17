export async function mockLogin(email,password){

  await new Promise(r=>setTimeout(r,500));

  const users =
    JSON.parse(localStorage.getItem("mock_users") || "[]");

  const found = users.find(u =>
    u.email === email && u.password === password
  );

  if(!found)
    throw new Error("Invalid credentials");

  return found;
}


export async function refreshTokenApi(refreshToken){
  await new Promise(r=>setTimeout(r,300));

  return {
    accessToken: "new-access"
  };
}
