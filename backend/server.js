const express = require("express");
const cors = require("cors");
const path = require("path"); // ✅ เพิ่ม

const app = express();

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(cors({
  origin:"http://localhost:5173",
  credentials:true
}));

app.use(express.json());

app.get("/",(req,res)=>{
  res.send("Backend running");
});

app.use("/api/auth", require("./routes/auth"));

app.listen(3000,"0.0.0.0",()=>{
 console.log("Server started");
});
