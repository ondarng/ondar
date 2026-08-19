'use client'

import { useRouter } from 'next/navigation'
import { ArrowUpDown, SlidersHorizontal } from 'lucide-react'

interface StorefrontFiltersProps {
  slug: string
  categories: string[]
  activeCategory: string
  activeSort: string
  searchQuery: string
}

export function StorefrontFilters({
  slug,
  categories,
  activeCategory,
  activeSort,
  searchQuery,
}: StorefrontFiltersProps) {
  const router = useRouter()

  function buildUrl(cat: string, sort: string) {
    const params = new URLSearchParams()
    if (cat !== 'All') params.set('category', cat)
    if (searchQuery) params.set('q', searchQuery)
    if (sort !== 'newest') params.set('sort', sort)
    const qs = params.toString()
    return `/${slug}${qs ? `?${qs}` : ''}`
  }

  return (
    <div className="space-y-3">
      {/* Category Pills & Sort Bar */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto hide-scrollbar py-1">
        {/* Horizontal Category Pills */}
        <div className="flex items-center gap-1.5 w-max">
          {categories.map((cat) => {
            const isActive = activeCategory === cat
            return (
              <button
                key={cat}
                onClick={() => router.push(buildUrl(cat, activeSort))}
                className={`px-4 py-2 rounded-2xl text-xs font-black tracking-tight whitespace-nowrap transition-all duration-200 border ${
                  isActive
                    ? 'bg-black text-white border-black shadow-xs scale-102'
                    : 'bg-white text-slate-600 border-slate-200/90 hover:border-slate-400 hover:text-black'
                }`}
              >
                {cat}
              </button>
            )
          })}
        </div>

        {/* Minimal Sort Pill */}
        <div className="shrink-0 pl-1">
          <div className="relative inline-flex items-center">
            <select
              value={activeSort}
              onChange={(e) => router.push(buildUrl(activeCategory, e.target.value))}
              className="appearance-none bg-white border border-slate-200/90 rounded-2xl pl-7 pr-3 py-2 text-xs font-black text-slate-800 outline-none cursor-pointer hover:border-black transition-all shadow-2xs"
            >
              <option value="newest">Latest Drop</option>
              <option value="price_asc">Price: Low → High</option>
              <option value="price_desc">Price: High → Low</option>
            </select>
            <ArrowUpDown className="w-3 h-3 text-slate-500 absolute left-2.5 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  )
}
