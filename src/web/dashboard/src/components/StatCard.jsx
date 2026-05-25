export default function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-200 flex-1 min-w-[180px]">
      <div className="flex items-center gap-2.5 mb-2">
        {Icon && (
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: (color || '#6366f1') + '22' }}
          >
            <Icon size={18} color={color || '#6366f1'} />
          </div>
        )}
        <span className="text-sm text-gray-500 font-medium">{label}</span>
      </div>
      <div className="text-3xl font-bold text-gray-900">{value}</div>
    </div>
  )
}
