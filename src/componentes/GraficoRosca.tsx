export function GraficoRosca() {
  return (
    <div className="donut-wrap">
      <div className="donut">
        <div>
          <strong>R$ 6.284</strong>
          <span>Total gasto</span>
        </div>
      </div>
      <div className="donut-legend">
        {[
          ["Moradia", "38,3%", "green"],
          ["Alimentação", "27,2%", "orange"],
          ["Transporte", "11,5%", "blue"],
          ["Compras", "7,8%", "purple"],
          ["Outras", "15,2%", "gray"],
        ].map(([name, value, color]) => (
          <div key={name}>
            <span>
              <i className={`dot ${color}-dot`} />
              {name}
            </span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
    </div>
  )
}
