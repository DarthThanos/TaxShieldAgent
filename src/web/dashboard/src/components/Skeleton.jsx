export function SkeletonBlock({ className = '' }) {
  return <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
}

export function SkeletonStatCards() {
  return (
    <div className="flex gap-4 flex-wrap mb-8">
      {[1,2,3,4].map(i => (
        <div key={i} className="bg-white rounded-xl p-5 border border-gray-200 flex-1 min-w-[180px]">
          <div className="flex items-center gap-2.5 mb-3">
            <SkeletonBlock className="w-9 h-9 rounded-lg" />
            <SkeletonBlock className="h-3.5 w-24" />
          </div>
          <SkeletonBlock className="h-8 w-16" />
        </div>
      ))}
    </div>
  )
}

export function SkeletonTable({ rows = 5, cols = 5 }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="border-b-2 border-gray-200 flex gap-4 px-4 py-3">
        {Array.from({ length: cols }).map((_, i) => (
          <SkeletonBlock key={i} className="h-3 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 px-4 py-3 border-b border-gray-50">
          {Array.from({ length: cols }).map((_, j) => (
            <SkeletonBlock key={j} className={`h-3.5 ${j === 0 ? 'w-28' : 'flex-1'}`} />
          ))}
        </div>
      ))}
    </div>
  )
}

export function SkeletonAlerts({ count = 3 }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
          <SkeletonBlock className="w-5 h-5 rounded-full flex-shrink-0" />
          <div className="flex-1">
            <SkeletonBlock className="h-4 w-32 mb-1.5" />
            <SkeletonBlock className="h-3 w-48" />
          </div>
          <SkeletonBlock className="h-5 w-16 rounded-full" />
          <SkeletonBlock className="h-1.5 w-24 rounded-full" />
          <SkeletonBlock className="w-4 h-4" />
        </div>
      ))}
    </div>
  )
}
