function ResultList({ title, items }) {
  if (!items?.length) {
    return null
  }

  return (
    <div className="result-group">
      <h3>{title}</h3>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  )
}

export default ResultList
