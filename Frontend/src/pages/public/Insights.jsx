import { Link } from "react-router-dom";

export default function Insights() {
  return (
    <div className="min-h-[70vh] bg-[#0B141A] flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        <p className="text-[#FFA500] text-xs font-bold tracking-[0.3em] uppercase mb-4">
          Coming Soon
        </p>
        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">
          Ellcworth Insights
        </h1>
        <p className="text-[#9A9EAB] text-sm leading-relaxed mb-8">
          Freight guides, customs explainers, and trade intelligence for UK exporters
          shipping to Ghana and West Africa. Launching soon.
        </p>
        <Link to="/">
          <button className="bg-[#FFA500] text-[#1A2930] px-6 py-3 rounded-full text-sm font-bold tracking-[0.14em] uppercase hover:opacity-90 transition">
            Back to Home
          </button>
        </Link>
      </div>
    </div>
  );
}
