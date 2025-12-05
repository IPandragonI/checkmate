"use client";

import React from 'react';
import Link from 'next/link';
import {CATEGORY_DEFINITIONS} from '@/app/types/game';
import ChessboardWrapper from "@/app/components/chessBoard/ChessboardWrapper";
import Footer from "@/app/components/ui/Footer";

export default function PuzzlesIndexPage() {
    return (
        <main className="p-6 space-y-4 text-base-content">
            <h1 className="text-3xl font-bold mb-10">Problèmes - Parcourir par thème</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {CATEGORY_DEFINITIONS.map(cat => (
                    <section key={cat.key} className="p-4 rounded-lg bg-base-200 flex flex-col items-center gap-2">
                        <div className="flex item-center justify-between w-full px-1">
                            <h2 className="text-xl font-semibold">{cat.label}</h2>
                            <Link key={cat.key} href={`/puzzles/${encodeURIComponent(cat.key)}`}
                                  className="btn btn-outline btn-sm">
                                Résoudre
                            </Link>
                        </div>
                        <div className="p-4 bg-base-100 border border-gray-200 rounded">
                            <ChessboardWrapper currentFen={cat.exampleFen} showAnimations={false}/>
                        </div>
                    </section>
                ))}
            </div>
            <Footer />
        </main>
    );
}