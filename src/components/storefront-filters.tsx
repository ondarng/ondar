'use client'

import { useRouter } from 'next/navigation'

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
    <div className="space-y-2">
      {/* Collections & Sort Row */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-3 shadow-2xs flex flex-wrap items-center justify-between gap-2">
        {/* Collections Dropdown */}
        {categories.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 shrink-0">Collections:</span>
            <select
              value={activeCategory}
              onChange={(e) => router.push(buildUrl(e.target.value, activeSort))}
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 outline-none cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        )}

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700 shrink-0">Sort:</span>
          <select
            value={activeSort}
            onChange={(e) => router.push(buildUrl(activeCategory, e.target.value))}
            className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 outline-none cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Category Pills */}
      {categories.length > 1 && (
        <div className="overflow-x-auto hide-scrollbar">
          <div className="flex items-center gap-2 w-max py-0.5">
            {categories.map((cat) => {
              const isActive = activeCategory === cat
              return (
                <button
                  key={cat}
                  onClick={() => router.push(buildUrl(cat, activeSort))}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wide whitespace-nowrap border transition-all ${
                    isActive
                      ? 'bg-[--accent] text-white border-transparent shadow-sm font-extrabold'
                      : 'bg-white text-slate-500 border-slate-200/80'
                  }`}
                  style={isActive ? { backgroundColor: 'var(--accent, #00A859)' } : {}}
                >
                  {cat}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
