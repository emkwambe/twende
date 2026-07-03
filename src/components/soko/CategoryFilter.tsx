// TWENDE Soko Commerce v2 — Category Filter
// Sprint 10: Marketplace

import type { Category } from '../../soko/types';

interface CategoryFilterProps {
  categories: Category[];
  activeCategory: string;
  onSelect: (categoryId: string) => void;
}

const iconMap: Record<string, string> = {
  grid: '⊞',
  shirt: '👕',
  smartphone: '📱',
  coffee: '☕',
  sparkles: '✨',
  home: '🏠',
};

export default function CategoryFilter({ categories, activeCategory, onSelect }: CategoryFilterProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
            activeCategory === cat.id
              ? 'bg-soko text-white shadow-sm'
              : 'bg-surface text-text2 border border-border hover:bg-bg hover:text-text'
          }`}
        >
          <span className="text-sm">{iconMap[cat.icon] || '•'}</span>
          {cat.name}
          {cat.productCount > 0 && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
              activeCategory === cat.id ? 'bg-white/20' : 'bg-bg text-text3'
            }`}>
              {cat.productCount}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
