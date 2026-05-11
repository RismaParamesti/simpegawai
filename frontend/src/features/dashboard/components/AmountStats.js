function AmountStats({}) {
  return (
    <div className="stats w-full rounded-[1.5rem] border border-base-300/70 bg-base-100/90 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl">
      <div className="stat px-5 py-5">
        <div className="stat-title">Amount to be Collected</div>
        <div className="stat-value">$25,600</div>
        <div className="stat-actions">
          <button className="btn btn-xs btn-primary shadow-sm shadow-primary/20">
            View Users
          </button>
        </div>
      </div>

      <div className="stat px-5 py-5">
        <div className="stat-title">Cash in hand</div>
        <div className="stat-value">$5,600</div>
        <div className="stat-actions">
          <button className="btn btn-xs btn-outline rounded-full border-base-300">
            View Members
          </button>
        </div>
      </div>
    </div>
  );
}

export default AmountStats;
