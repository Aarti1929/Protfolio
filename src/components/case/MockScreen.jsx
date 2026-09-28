/** A data-driven product screen used as the "screenshots" in each case study. */
export default function MockScreen({ data }) {
  const max = Math.max(...data.chart)
  return (
    <div className="screen" role="img" aria-label={`${data.title} screen: ${data.kpi}, ${data.kpiLabel}`}>
      <div className="screen__status" aria-hidden="true">
        <span>9:41</span>
        <span className="screen__notch" />
        <span>●●●</span>
      </div>
      <div className="screen__title" aria-hidden="true">{data.title}</div>
      <div className="screen__kpi" aria-hidden="true">
        <span>{data.kpiLabel}</span>
        <strong>{data.kpi}</strong>
        <em>{data.delta}</em>
      </div>
      <div className="screen__chart" aria-hidden="true">
        {data.chart.map((v, i) => (
          <i key={i} style={{ height: `${(v / max) * 100}%`, opacity: 0.35 + (i / data.chart.length) * 0.65 }} />
        ))}
      </div>
      <ul className="screen__rows" aria-hidden="true">
        {data.rows.map(([a, b]) => (
          <li key={a}>
            <span>{a}</span>
            <b>{b}</b>
          </li>
        ))}
      </ul>
    </div>
  )
}
