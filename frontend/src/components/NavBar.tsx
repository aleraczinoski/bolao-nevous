import { useNavigate, useLocation } from "react-router-dom";

const items = [
  { path: "/dashboard", icon: "⚽", label: "Jogos" },
  { path: "/ranking", icon: "🏆", label: "Ranking" },
  { path: "/palpites", icon: "📋", label: "Palpites" },
  { path: "/profile", icon: "👤", label: "Perfil" },
];

export function NavBar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur border-t border-slate-800 md:hidden">
      <div className="flex">
        {items.map((item) => {
          const active = pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${
                active ? "text-blue-400" : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <span className="text-xl leading-none">{item.icon}</span>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${active ? "text-blue-400" : ""}`}>
                {item.label}
              </span>
              {active && <span className="absolute bottom-0 w-6 h-0.5 bg-blue-400 rounded-full" />}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
