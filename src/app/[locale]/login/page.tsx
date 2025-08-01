import Login from "@/app/components/auth/Login";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login",
};

export default function LoginPage() {
  return <Login />;
}