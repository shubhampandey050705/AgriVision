export default function PriceChart({ data = [] }) {
  const prices = data.map(d => d.price);
  if (!prices.length) {
    return <div className="h-56" />;
  }

  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const points = data
    .map((d, i) => {
      const x = (i / Math.max(data.length - 1, 1)) * 100;
      const y =
        max === min ? 50 : 100 - ((d.price - min) / (max - min)) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="h-56">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <polyline
          points={points}
          fill="none"
          stroke="#0ea5e9"
          strokeWidth="2"
        />
      </svg>
    </div>
  );
}

