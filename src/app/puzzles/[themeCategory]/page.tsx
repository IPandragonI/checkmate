import React from 'react';
import {PuzzlePlayer} from '@/app/puzzles/PuzzlePlayer';

interface Props {
  params: { themeCategory: string };
}

export default async function ThemeCategoryPage({ params }: Props) {
  const themeCategory = await decodeURIComponent(params.themeCategory);
  return (
      <PuzzlePlayer themeCategory={themeCategory} />
  );
}

