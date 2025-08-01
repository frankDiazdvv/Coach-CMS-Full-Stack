import Signup from "@/app/components/auth/SignUp";
import { Metadata } from "next";


export const metadata: Metadata = {
  title: "Sign Up",
  openGraph: {
    images: [
      {
        url: "https://litetrainer.com/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Sign-Up Page",
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    description: 'Begginer-friendly client management system for fitness coaches.',
    images: ['https://litetrainer.com/opengraph-image.png'],
  },
};

export default function SignUpPage() {
  return <Signup />;
}