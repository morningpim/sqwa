import { USERS } from "./seedUsers";

export async function mockLogin(email,password){
  await delay(500);

  const user = USERS.find(
    u=>u.email===email && u.password===password
  );

  if(!user){
    return { success:false, message:"Invalid email or password" };
  }

  return { success:true, user };
}

function delay(ms){
  return new Promise(res=>setTimeout(res,ms));
}
