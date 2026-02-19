export async function mockLogin(email,password){
  await delay(500);

  const user = USERS.find(u =>
    u.email.toLowerCase().trim() === email.toLowerCase().trim() &&
    String(u.password).trim() === String(password).trim()
  );

  if(!user){
    return { success:false, message:"Invalid email or password" };
  }

  return { success:true, user };
}
