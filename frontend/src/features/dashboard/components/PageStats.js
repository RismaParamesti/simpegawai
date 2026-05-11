import HeartIcon from "@heroicons/react/24/outline/HeartIcon";
import BoltIcon from "@heroicons/react/24/outline/BoltIcon";

function PageStats({}) {
  return (
    <div className="stats w-full rounded-[1.5rem] border border-base-300/70 bg-base-100/90 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl">
      <div className="stat px-5 py-5">
        <div className="stat-figure invisible md:visible text-primary">
          <HeartIcon className="h-8 w-8" />
        </div>
        <div className="stat-title text-base-content/60">Total Likes</div>
        <div className="stat-value">25.6K</div>
        <div className="stat-desc text-base-content/60">
          21% more than last month
        </div>
      </div>

      <div className="stat px-5 py-5">
        <div className="stat-figure invisible md:visible text-secondary">
          <BoltIcon className="h-8 w-8" />
        </div>
        <div className="stat-title text-base-content/60">Page Views</div>
        <div className="stat-value">2.6M</div>
        <div className="stat-desc text-base-content/60">
          14% more than last month
        </div>
      </div>
    </div>
  );
}

export default PageStats;
