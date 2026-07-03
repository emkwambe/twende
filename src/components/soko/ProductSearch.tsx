// TWENDE Soko Commerce v2 — Product Search with Autocomplete
// Sprint 10: Marketplace

import { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import type { SokoProduct } from '../../soko/types';

interface ProductSearchProps {
  products: SokoProduct[];
  onSearch: (query: string) => void;
  onSelectProduct?: (productId: string) => void;
  placeholder?: string;
}

export default function ProductSearch({
  products,
  onSearch,
  onSelectProduct,
  placeholder = 'Search products...',
}: ProductSearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const suggestions = query.length >= 2
    ? products
        .filter((p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.tags.some((t) => t.toLowerCase().includes(query.toLowerCase())) ||
          p.category.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 5)
    : [];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (value: string) => {
    setQuery(value);
    onSearch(value);
    setIsOpen(value.length >= 2);
  };

  const handleSelect = (productId: string) => {
    setQuery('');
    setIsOpen(false);
    onSelectProduct?.(productId);
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text3" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-soko/50 focus:border-soko/50 transition-all"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              onSearch('');
              setIsOpen(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-bg transition-colors"
          >
            <X className="w-4 h-4 text-text3" />
          </button>
        )}
      </div>
      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-surface rounded-xl border border-border shadow-lg z-50 overflow-hidden">
          {suggestions.map((product) => (
            <button
              key={product.id}
              onClick={() => handleSelect(product.id)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-bg transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-bg to-border flex items-center justify-center shrink-0">
                <span className="text-sm font-bold text-soko/40">{product.name.charAt(0)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text truncate">{product.name}</p>
                <p className="text-xs text-text3">KES {product.price.toLocaleString()} · {product.category}</p>
              </div>
            </button>
          ))}
        </div>
      )}
      {isOpen && query.length >= 2 && suggestions.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-surface rounded-xl border border-border shadow-lg z-50 p-4 text-center">
          <p className="text-sm text-text3">No products found for &quot;{query}&quot;</p>
        </div>
      )}
    </div>
  );
}
