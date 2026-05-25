const CLASSES = {
  stripe:  'bg-violet-100 text-violet-800',
  shopify: 'bg-green-100 text-green-800',
  etsy:    'bg-orange-100 text-orange-800',
  paypal:  'bg-blue-100 text-blue-800',
  square:  'bg-teal-100 text-teal-800',
  amazon:  'bg-yellow-100 text-yellow-800',
}

export default function PlatformBadge({ platform }) {
  const cls = CLASSES[(platform || '').toLowerCase()] || 'bg-gray-100 text-gray-700'
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${cls}`}>
      {platform}
    </span>
  )
}
