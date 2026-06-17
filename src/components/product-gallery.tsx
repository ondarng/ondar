'use client'

import { useState } from 'react'

export function ProductGallery({ images }: { images: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0)

  if (!images || images.length === 0) return null

  return (
    <div className="relative w-full h-[60vh] md:h-[70vh] bg-neutral-100 overflow-hidden">
      <div 
        className="flex w-full h-full snap-x snap-mandatory overflow-x-auto hide-scrollbar"
        onScroll={(e) => {
          const container = e.currentTarget
          const scrollPosition = container.scrollLeft
          const width = container.clientWidth
          setCurrentIndex(Math.round(scrollPosition / width))
        }}
      >
        {images.map((url, idx) => (
          <div key={idx} className="w-full h-full flex-shrink-0 snap-center">
            <img 
              src={url} 
              alt={`Product image ${idx + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
      
      {/* Subtle bottom gradient to ensure text readability if it overlaps */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/20 to-transparent pointer-events-none flex items-end justify-center pb-4">
        {images.length > 1 && (
          <div className="flex gap-1.5">
            {images.map((_, idx) => (
              <div 
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/50'}`}
              />
            ))}
          </div>
        )}
      </div>
      
      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  )
}
