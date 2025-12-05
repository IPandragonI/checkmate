import React from 'react';
import {PuzzlePlayer} from '@/app/puzzles/PuzzlePlayer';

export default async function ThemeCategoryPage({ params }: { params: Promise<{ themeCategory: string }> }) {
    const resolved = await params;
    const themeCategory = decodeURIComponent(resolved?.themeCategory);

    if (!themeCategory) {
        return <div className="p-8 text-center text-red-500">Paramètre de catégorie de thème manquant</div>;
    }

    return (
      <PuzzlePlayer themeCategory={themeCategory} />
  );
}
