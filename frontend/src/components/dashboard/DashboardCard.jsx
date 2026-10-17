import "../../styles/dashboard.css";

function DashboardCard({ title, value, subtitle, icon, accent = "blue" }) {
  return (
    <article className={`dashboard-card accent-${accent}`}>
      <div className="dashboard-card-top">
        <div>
          <p className="card-title">{title}</p>
          <h2 className="card-value">{value}</h2>
          <p className="card-subtitle">{subtitle}</p>
        </div>
        <div className="card-icon">{icon}</div>
      </div>
    </article>
  );
}

export default DashboardCard;
