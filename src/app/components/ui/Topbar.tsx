"use client";

import {Bell} from "lucide-react";
import Link from "next/link";
import {useSession, signOut} from "@/lib/auth-client";
import Swal from 'sweetalert2'

export default function Topbar() {
    const {user} = useSession().data || {};

    function handleLogout() {
        Swal.fire({
            title: 'Déconnexion',
            text: 'Voulez-vous vraiment vous déconnecter ?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Oui, déconnecter',
            cancelButtonText: 'Annuler'
        }).then((result) => {
            if (result.isConfirmed) {
                signOut();
                window.location.href = "/auth/login-or-register";
            }
        });
    }

    return (
        <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-end gap-4 p-4">
            {/*<button className="btn btn-circle" aria-label="Notifications">*/}
            {/*    <Bell size={24}/>*/}
            {/*</button>*/}
            {user && (
            <div className="dropdown dropdown-end">
                <div tabIndex={0} role="button" className="btn avatar rounded-full gap-4">
                    {user?.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={user?.image} alt="User Avatar" className="rounded-full w-8 h-8 object-cover"/>
                    ) : (
                        <span className="text-lg">
                                {user?.username ? user.username.charAt(0).toUpperCase() : "U"}
                            </span>
                    )}
                    <span className="font-semibold text-base-content">{user?.username}</span>
                </div>
                <ul tabIndex={0}
                    className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow">
                    <li><Link href="/profile">Profil</Link></li>
                    <li><button onClick={handleLogout}>Se déconnecter</button></li>
                </ul>
            </div>
            )}
        </div>
    );
}

