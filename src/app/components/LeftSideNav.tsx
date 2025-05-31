import Link from "next/link";

const LeftSideNav: React.FC = () => {

    return(
        <nav className="left-side-nav">
            <ul>
                <li>
                    <Link href="/">Home</Link>
                </li>
                <li>
                    <Link href="/about">About</Link>
                </li>
                <li>
                    <Link href="/contact">Contact</Link>
                </li>
            </ul>
        </nav>
    );
}

export default LeftSideNav;