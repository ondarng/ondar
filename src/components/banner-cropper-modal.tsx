'use client'

import { useState, useRef, useEffect } from 'react'
import { Crop, ZoomIn, ZoomOut, Check, X, Move, RotateCw } from 'lucide-react'

interface BannerCropperModalProps {
  imageSrc: string
  isOpen: boolean
  onClose: () => void
  onCropComplete: (croppedDataUrl: string) => void
}

export function BannerCropperModal({
  imageSrc,
  isOpen,
  onClose,
  onCropComplete,
}: BannerCropperModalProps) {
  const [zoom, setZoom] = useState(1)
  const [offsetY, setOffsetY] = useState(0)
  const [offsetX, setOffsetX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  const imageRef = useRef<HTMLImageElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    if (isOpen) {
      setZoom(1)
      setOffsetX(0)
      setOffsetY(0)
    }
  }, [isOpen, imageSrc])

  if (!isOpen) return null

  // Handle Drag / Pan
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX - offsetX, y: e.clientY - offsetY })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    setOffsetX(e.clientX - dragStart.x)
    setOffsetY(e.clientY - dragStart.y)
  }

  const handleMouseUp = () => setIsDragging(false)

  // Touch Support for Mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true)
      setDragStart({ x: e.touches[0].clientX - offsetX, y: e.touches[0].clientY - offsetY })
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return
    setOffsetX(e.touches[0].clientX - dragStart.x)
    setOffsetY(e.touches[0].clientY - dragStart.y)
  }

  const handleTouchEnd = () => setIsDragging(false)

  // Render Crop to Canvas (1200 x 400 - 3:1 ratio)
  const handleApplyCrop = () => {
    const img = imageRef.current
    if (!img) return

    const canvas = document.createElement('canvas')
    const targetWidth = 1200
    const targetHeight = 400
    canvas.width = targetWidth
    canvas.height = targetHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Draw background
    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, targetWidth, targetHeight)

    // Calculate scaling
    const containerAspect = targetWidth / targetHeight
    const imgAspect = img.naturalWidth / img.naturalHeight

    let drawWidth = targetWidth
    let drawHeight = targetHeight

    if (imgAspect > containerAspect) {
      drawHeight = targetHeight * zoom
      drawWidth = drawHeight * imgAspect
    } else {
      drawWidth = targetWidth * zoom
      drawHeight = drawWidth / imgAspect
    }

    // Apply offset proportional to canvas resolution
    const previewContainer = img.parentElement
    const scaleFactor = targetWidth / (previewContainer?.clientWidth || targetWidth)

    const drawX = (targetWidth - drawWidth) / 2 + offsetX * scaleFactor
    const drawY = (targetHeight - drawHeight) / 2 + offsetY * scaleFactor

    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight)

    const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.9)
    onCropComplete(croppedDataUrl)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border-2 border-black max-w-2xl w-full p-5 space-y-4 shadow-2xl animate-fade-in text-black">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-black/10 pb-3">
          <div className="flex items-center gap-2">
            <Crop className="w-5 h-5 text-[#00A859]" />
            <h3 className="font-black text-sm uppercase tracking-wider">Crop & Position Hero Banner</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-500 hover:text-black"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Banner Crop Viewport (3:1 standard banner aspect) */}
        <div className="space-y-1.5">
          <p className="text-[11px] text-neutral-500 font-bold flex items-center gap-1">
            <Move className="w-3 h-3" />
            <span>Drag image to position • Use slider below to zoom</span>
          </p>

          <div
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="relative w-full aspect-[3/1] bg-neutral-900 rounded-2xl overflow-hidden border-2 border-black cursor-grab active:cursor-grabbing select-none flex items-center justify-center"
          >
            <img
              ref={imageRef}
              src={imageSrc}
              alt="Banner Crop Preview"
              style={{
                transform: `translate(${offsetX}px, ${offsetY}px) scale(${zoom})`,
                transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                maxWidth: 'none',
              }}
              className="w-full h-full object-cover pointer-events-none"
              draggable={false}
            />

            {/* Grid overlay lines */}
            <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 border border-white/20">
              <div className="border-r border-b border-white/10" />
              <div className="border-r border-b border-white/10" />
              <div className="border-b border-white/10" />
              <div className="border-r border-b border-white/10" />
              <div className="border-r border-b border-white/10" />
              <div className="border-b border-white/10" />
              <div className="border-r border-white/10" />
              <div className="border-r border-white/10" />
              <div />
            </div>

            <div className="absolute top-2 right-2 bg-black/70 text-white text-[9px] font-black px-2 py-0.5 rounded-md backdrop-blur-xs">
              3:1 Storefront Banner
            </div>
          </div>
        </div>

        {/* Controls: Zoom Slider & Reset */}
        <div className="bg-neutral-50 p-3.5 rounded-2xl border border-black/10 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <ZoomOut className="w-4 h-4 text-neutral-500 shrink-0" />
            <input
              type="range"
              min="1"
              max="3"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full accent-[#00A859] cursor-pointer"
            />
            <ZoomIn className="w-4 h-4 text-neutral-500 shrink-0" />
            <span className="font-mono font-black text-[11px] w-10 text-right">{Math.round(zoom * 100)}%</span>
          </div>

          <button
            type="button"
            onClick={() => {
              setZoom(1)
              setOffsetX(0)
              setOffsetY(0)
            }}
            className="px-3 py-1.5 bg-white border border-black rounded-xl text-[11px] font-bold hover:bg-neutral-100 transition-colors"
          >
            Reset Position
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-black bg-white text-xs font-bold hover:bg-neutral-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApplyCrop}
            className="px-5 py-2 rounded-xl bg-[#00A859] text-white border border-black text-xs font-black hover:opacity-90 transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Check className="w-4 h-4" />
            <span>Apply Cropped Banner</span>
          </button>
        </div>
      </div>
    </div>
  )
}
