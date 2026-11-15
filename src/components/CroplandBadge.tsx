interface CroplandBadgeProps {
  share: number
}

function CroplandBadge({ share }: CroplandBadgeProps) {
  const safeShare = Math.min(Math.max(share, 0), 100)

  return (
    <div className="inline-flex min-h-12 max-w-full items-center gap-2 rounded-full bg-lime-100 px-4 text-base font-bold text-lime-900">
      <span aria-hidden="true">🌾</span>
      <span className="break-words">{safeShare}% cropland</span>
    </div>
  )
}

export default CroplandBadge
