export default function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center p-10">
      <div className="w-8 h-8 rounded-full border-[3px] border-gray-200 border-t-primary animate-spin" />
    </div>
  )
}
