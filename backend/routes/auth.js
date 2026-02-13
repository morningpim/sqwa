const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcrypt");
const upload = require("../middleware/upload");

const ALLOWED_ROLES = ["buyer","agent","landlord","investor"];

router.post("/signup",
upload.fields([
  { name:"id_card_image_front" },
  { name:"id_card_image_back" },
  { name:"selfie" },
  { name:"agent_license_image" }
]),
async (req,res)=>{
try{

/* ---------------- parse payload ---------------- */
let payload = {};

if(req.body.payload){
  try{
    payload = JSON.parse(req.body.payload);
  }catch{
    return res.status(400).json({success:false,message:"Invalid payload JSON"});
  }
}else{
  payload = req.body;
}

if(typeof payload !== "object")
  return res.status(400).json({success:false,message:"Invalid payload type"});


/* ---------------- destructure ---------------- */
let {
  role,
  email,
  password,
  first_name,
  last_name,
  phone,
  line_id,
  address,
  number_id_card
} = payload;


/* ---------------- sanitize ---------------- */
role = String(role || "").trim().toLowerCase();
email = String(email || "").trim().toLowerCase();
first_name = String(first_name || "").trim();
last_name = String(last_name || "").trim();
phone = String(phone || "").trim();

/* ---------------- helper validators ---------------- */
const isEmpty = v => !v || String(v).trim() === "";

const isEmail = v =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

const isPhone = v =>
  /^[0-9]{10}$/.test(v);

const isThaiId = v =>
  /^[0-9]{13}$/.test(v);

const isLicense = v =>
  /^[0-9]{10}$/.test(v);


/* ---------------- basic validation ---------------- */
if(!email || !password || !role)
  return res.status(400).json({success:false,message:"Missing required fields"});

/* ---------------- validation ---------------- */

if(isEmpty(email))
  return res.status(400).json({success:false,message:"Email required"});

if(!isEmail(email))
  return res.status(400).json({success:false,message:"Invalid email format"});


if(isEmpty(password))
  return res.status(400).json({success:false,message:"Password required"});

if(password.length < 6)
  return res.status(400).json({success:false,message:"Password must be at least 6 characters"});


if(isEmpty(first_name) || isEmpty(last_name))
  return res.status(400).json({success:false,message:"Name required"});


if(phone && !isPhone(phone))
  return res.status(400).json({success:false,message:"Phone must be 10 digits"});


if(isEmpty(number_id_card))
  return res.status(400).json({success:false,message:"ID card required"});

if(!isThaiId(number_id_card))
  return res.status(400).json({success:false,message:"ID card must be 13 digits"});

/* ---------------- role whitelist ---------------- */
if(!ALLOWED_ROLES.includes(role))
  return res.status(400).json({success:false,message:"Invalid role"});


/* ---------------- email format ---------------- */
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if(!emailRegex.test(email))
  return res.status(400).json({success:false,message:"Invalid email format"});


/* ---------------- password policy ---------------- */
if(password.length < 8)
  return res.status(400).json({success:false,message:"Password must be at least 8 characters"});


/* ---------------- phone ---------------- */
if(phone && !/^[0-9]{10}$/.test(phone))
  return res.status(400).json({success:false,message:"Phone must be 10 digits"});


/* ---------------- files ---------------- */
const front = req.files?.id_card_image_front?.[0]?.filename || null;
const back = req.files?.id_card_image_back?.[0]?.filename || null;
const selfie = req.files?.selfie?.[0]?.filename || null;
const license = req.files?.agent_license_image?.[0]?.filename || null;

if(!front || !back || !selfie)
  return res.status(400).json({success:false,message:"Missing verification images"});

if(role === "agent"){
  if(!license)
    return res.status(400).json({success:false,message:"Agent license required"});

  if(!isLicense(payload.number_license))
    return res.status(400).json({success:false,message:"License must be 10 digits"});
}

/* ---------------- role lookup ---------------- */
const [roleRow] = await db.query(
  "SELECT role_id FROM roles WHERE role_name=?",
  [role]
);

if(!roleRow.length)
  return res.status(400).json({success:false,message:"Role not found"});

const role_id = roleRow[0].role_id;


/* ---------------- duplicate email ---------------- */
const [exists] = await db.query(
  "SELECT user_id FROM users WHERE email=?",
  [email]
);

if(exists.length)
  return res.status(409).json({success:false,message:"Email already used"});


/* ---------------- hash password ---------------- */
const hash = await bcrypt.hash(password,12);


/* ---------------- insert user ---------------- */
await db.query(`
INSERT INTO users
(role_id,email,password_hash,first_name,last_name,phone,line_id,address,number_id_card,
id_card_image_front,id_card_image_back,selfie,license_image)
VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
`,[
role_id,email,hash,first_name,last_name,phone,line_id,address,
number_id_card,front,back,selfie,license
]);


/* ---------------- success ---------------- */
return res.status(201).json({
success:true,
message:"Signup successful"
});


}catch(err){
console.error("SIGNUP ERROR:",err);
return res.status(500).json({
success:false,
message:"Internal server error"
});
}
});

module.exports = router;
