import Login from "@/app/components/auth/Login";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login",
  openGraph: {
    images: [
      {
        url: "https://litetrainer.com/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Login Page",
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    description: 'Begginer-friendly client management system for fitness coaches.',
    images: ['https://litetrainer.com/opengraph-image.png'],
  },
};

export default function LoginPage() {
  return <Login />;
}