import Image from "next/image";

export default function Home() {
  return (
    <div>
      <h1>Welcome to Next.js!</h1>
      <Image src="/logo.svg" alt="Logo" width={100} height={100} />
    </div>
  );
}
