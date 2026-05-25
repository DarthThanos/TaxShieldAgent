import { useState } from 'react'
import {
  ComposableMap,
  Geographies,
  Geography,
  Annotation,
} from 'react-simple-maps'
import { colors } from '../design/tokens'

// US AlbersUsa topojson from react-simple-maps CDN
const GEO_URL = 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json'

// FIPS → state code mapping
const FIPS_TO_CODE = {
  '01':'AL','02':'AK','04':'AZ','05':'AR','06':'CA','08':'CO','09':'CT',
  '10':'DE','11':'DC','12':'FL','13':'GA','15':'HI','16':'ID','17':'IL',
  '18':'IN','19':'IA','20':'KS','21':'KY','22':'LA','23':'ME','24':'MD',
  '25':'MA','26':'MI','27':'MN','28':'MS','29':'MO','30':'MT','31':'NE',
  '32':'NV','33':'NH','34':'NJ','35':'NM','36':'NY','37':'NC','38':'ND',
  '39':'OH','40':'OK','41':'OR','42':'PA','44':'RI','45':'SC','46':'SD',
  '47':'TN','48':'TX','49':'UT','50':'VT','51':'VA','53':'WA','54':'WV',
  '55':'WI','56':'WY',
}

const STATE_NAMES = {
  AL:'Alabama',AK:'Alaska',AZ:'Arizona',AR:'Arkansas',CA:'California',
  CO:'Colorado',CT:'Connecticut',DE:'Delaware',FL:'Florida',GA:'Georgia',
  HI:'Hawaii',ID:'Idaho',IL:'Illinois',IN:'Indiana',IA:'Iowa',
  KS:'Kansas',KY:'Kentucky',LA:'Louisiana',ME:'Maine',MD:'Maryland',
  MA:'Massachusetts',MI:'Michigan',MN:'Minnesota',MS:'Mississippi',MO:'Missouri',
  MT:'Montana',NE:'Nebraska',NV:'Nevada',NH:'New Hampshire',NJ:'New Jersey',
  NM:'New Mexico',NY:'New York',NC:'North Carolina',ND:'North Dakota',OH:'Ohio',
  OK:'Oklahoma',OR:'Oregon',PA:'Pennsylvania',RI:'Rhode Island',SC:'South Carolina',
  SD:'South Dakota',TN:'Tennessee',TX:'Texas',UT:'Utah',VT:'Vermont',
  VA:'Virginia',WA:'Washington',WV:'West Virginia',WI:'Wisconsin',WY:'Wyoming',
  DC:'District of Columbia',
}

const NO_SALES_TAX = new Set(['MT','NH','OR','DE','AK'])

function fillColor(stateCode, stateData) {
  if (NO_SALES_TAX.has(stateCode)) return '#dbeafe'   // no-tax: light blue
  if (!stateData) return '#e5e7eb'                     // no data: gray
  return colors.risk[stateData.risk_level] || '#e5e7eb'
}

function formatCurrency(val) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD',
    minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val || 0)
}

export default function NexusMap({ nexusData = [], onStateClick }) {
  const [tooltip, setTooltip] = useState(null) // { code, x, y }

  const stateMap = {}
  nexusData.forEach(s => { stateMap[s.state] = s })

  const tooltipData = tooltip ? stateMap[tooltip.code] : null
  const tooltipNoTax = tooltip ? NO_SALES_TAX.has(tooltip.code) : false

  return (
    <div className="relative">
      <ComposableMap
        projection="geoAlbersUsa"
        projectionConfig={{ scale: 880 }}
        style={{ width: '100%', height: 'auto' }}
      >
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map(geo => {
              const fips = geo.id?.toString().padStart(2, '0')
              const code = FIPS_TO_CODE[fips] || ''
              const data = stateMap[code]
              const fill = fillColor(code, data)
              const clickable = data && ['RED','CRITICAL','YELLOW'].includes(data?.risk_level)

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={fill}
                  stroke="#fff"
                  strokeWidth={0.8}
                  style={{
                    default: { outline: 'none', cursor: clickable ? 'pointer' : 'default' },
                    hover:   { outline: 'none', filter: 'brightness(0.9)', cursor: clickable ? 'pointer' : 'default' },
                    pressed: { outline: 'none' },
                  }}
                  onMouseEnter={e => setTooltip({ code, x: e.clientX, y: e.clientY })}
                  onMouseMove={e => setTooltip(t => t ? { ...t, x: e.clientX, y: e.clientY } : null)}
                  onMouseLeave={() => setTooltip(null)}
                  onClick={() => clickable && onStateClick?.(code, data)}
                />
              )
            })
          }
        </Geographies>
      </ComposableMap>

      {/* Floating tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none bg-gray-800 text-white text-xs px-3 py-2 rounded-lg shadow-xl"
          style={{ left: tooltip.x + 12, top: tooltip.y - 10 }}
        >
          <div className="font-semibold mb-0.5">{STATE_NAMES[tooltip.code] || tooltip.code}</div>
          {tooltipNoTax ? (
            <div className="text-gray-300">No sales tax</div>
          ) : tooltipData ? (
            <>
              <div>Sales: {formatCurrency(tooltipData.total_sales)}</div>
              <div>Threshold: {formatCurrency(tooltipData.threshold_revenue)}</div>
              <div>Used: {tooltipData.pct_of_threshold}%</div>
              <div className="mt-0.5 font-semibold" style={{ color: colors.risk[tooltipData.risk_level] }}>
                {tooltipData.risk_level}
              </div>
            </>
          ) : (
            <div className="text-gray-300">No sales data</div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="flex gap-4 mt-3 flex-wrap text-xs text-gray-500">
        {[
          { label: 'No Data',      color: '#e5e7eb' },
          { label: 'No Sales Tax', color: '#dbeafe' },
          { label: 'Green',        color: colors.risk.GREEN    },
          { label: 'Yellow',       color: colors.risk.YELLOW   },
          { label: 'Red',          color: colors.risk.RED      },
          { label: 'Critical',     color: colors.risk.CRITICAL },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-[3px]" style={{ backgroundColor: item.color }} />
            {item.label}
          </div>
        ))}
      </div>
    </div>
  )
}
