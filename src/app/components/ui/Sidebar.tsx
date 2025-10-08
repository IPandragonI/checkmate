import Link from "next/link";
import { APP_TITLE } from "@/lib/constants";
import { Crown, Menu, Swords, UsersRound } from 'lucide-react';


export default function Sidebar({ children }: { children: React.ReactNode }) {
    const menuItems = [
        { name: "Créer une partie", href: "/games/create", icon: Swords },
        { name: "Rejoindre une partie", href: "/games/join", icon: UsersRound },
    ];

    return (
        <aside className="drawer lg:drawer-open">
            <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
            <div className="drawer-content flex lg:flex-col">
                <label htmlFor="my-drawer-2" className="drawer-button lg:hidden p-6 cursor-pointer">
                    <Menu size={20} />
                </label>
                <div className="flex-1 bg-base-100">
                    {children}
                </div>
            </div>
            <div className="drawer-side py-2 bg-base-300 border-r border-base-300">
                <label htmlFor="my-drawer-2" aria-label="close sidebar" className="drawer-overlay"></label>
                <Link className="border-b border-base-300 cursor-pointer" href="/">
                    <div className="text-2xl font-bold text-primary p-4">
                        <Crown className="inline-block mr-2 mb-1" size={24}/>
                        {APP_TITLE}
                    </div>
                </Link>
                <ul className="menu bg-base-200 text-base-content w-64 p-4 space-y-2">
                    {menuItems.map((item) => (
                        <li key={item.name}>
                            <Link href={item.href}>
                                <item.icon className="inline-block mr-2 mb-1" size={16}/>
                                {item.name}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </aside>
    );
}
