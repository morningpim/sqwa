const db = require("./db");

async function test(){
  try{
    const [rows] = await db.query("SELECT 1");
    console.log("DB CONNECTED:", rows);
  }catch(err){
    console.error(err);
  }
}

test();
