import { useContext } from "react";
import { useAuth } from "../auth/AuthProvider";


export default function useAuthStrict(){
  const ctx = useAuth();
  if(!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
