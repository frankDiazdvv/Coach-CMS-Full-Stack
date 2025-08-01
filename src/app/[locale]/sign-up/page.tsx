import Signup from "@/app/components/auth/SignUp";
import { Metadata } from "next";


export const metadata: Metadata = {
  title: "Sign Up",
};

export default function SignUpPage() {
  return <Signup />;
}