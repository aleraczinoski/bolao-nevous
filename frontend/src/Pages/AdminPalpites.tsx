import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import type { AdminPrediction } from "../types/api";

export function AdminPalpites() {
  const navigate = useNavigate();
  const [palpites, setPalpites] = useState<AdminPrediction[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [filtroUsuario, setFiltroUsuario] = useState("");
  const [filtroPartida, setFiltroPartida] = useState("");

  useEffect(() => {
    api
      .get<AdminPrediction[]>("/predictions/finished")
      .then((res) => setPalpites(res.data))
      .catch((err) => setErro(err?.response?.data?.message ?? "Erro ao carregar palpites."))
      .finally(() => setCarregando(false));
  }, []);

  const usuarios = [...new Set(palpites.map((p) => p.user.displayName))].sort();
  const partidas = [...new Set(palpites.map((p) => `${p.match.homeTeam.name} x ${p.match.awayTeam.name}`))].sort();

  const filtrados = palpites.filter((p) => {
    const nomePartida = `${p.match.homeTeam.name} x ${p.match.awayTeam.name}`;
    return (
      (!filtroUsuario || p.user.displayName === filtroUsuario) &&
      (!filtroPartida || nomePartida === filtroPartida)
    );
  });

  function badgePts(pts: number | null) {
    if (pts === null) return <span className="text-xs text-gray-400">—</span>;
    const cores: Record<number, string> = {
      0: "bg-gray-100 text-gray-500",
      1: "bg-gray-200 text-gray-600",
      2: "bg-yellow-100 text-yellow-700",
      3: "bg-orange-100 text-orange-700",
      4: "bg-blue-100 text-blue-700",
      5: "bg-purple-100 text-purple-700",
      6: "bg-green-100 text-green-700",
      7: "bg-emerald-100 text-emerald-700",
    };
    return (
      <span className={`px-2 py-1 rounded-md text-xs font-bold ${cores[pts] ?? "bg-green-100 text-green-700"}`}>
        {pts} pts
      </span>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-black text-gray-800 tracking-tight">Palpites</h1>
          <button onClick={() => navigate("/dashboard")} className="text-blue-600 font-bold hover:underline">
            Voltar
          </button>
        </div>

        {erro && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 text-red-600 font-semibold text-sm">
            {erro}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <select
            value={filtroUsuario}
            onChange={(e) => setFiltroUsuario(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white shadow-sm flex-1"
          >
            <option value="">Todos os participantes</option>
            {usuarios.map((u) => <option key={u} value={u}>{u}</option>)}
          </select>

          <select
            value={filtroPartida}
            onChange={(e) => setFiltroPartida(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white shadow-sm flex-1"
          >
            <option value="">Todas as partidas</option>
            {partidas.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>

          {(filtroUsuario || filtroPartida) && (
            <button
              onClick={() => { setFiltroUsuario(""); setFiltroPartida(""); }}
              className="text-sm text-gray-500 hover:text-gray-700 font-semibold px-3"
            >
              Limpar
            </button>
          )}
        </div>

        {carregando ? (
          <div className="bg-white rounded-2xl shadow border border-gray-100 animate-pulse h-64" />
        ) : palpites.length === 0 ? (
          <div className="bg-white rounded-2xl shadow border border-gray-100 p-12 text-center text-gray-400 font-semibold">
            Nenhuma partida finalizada ainda.
          </div>
        ) : filtrados.length === 0 ? (
          <div className="bg-white rounded-2xl shadow border border-gray-100 p-12 text-center text-gray-400 font-semibold">
            Nenhum palpite para o filtro selecionado. ({palpites.length} no total)
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow border border-gray-100 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wider text-gray-400">
                  <th className="px-5 py-3">Participante</th>
                  <th className="px-5 py-3">Partida</th>
                  <th className="px-5 py-3 text-center">Palpite</th>
                  <th className="px-5 py-3 text-center">Resultado</th>
                  <th className="px-5 py-3 text-center">Pts</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((p) => (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 font-semibold text-gray-800">{p.user.displayName}</td>
                    <td className="px-5 py-3">
                      <p className="font-semibold text-gray-700">
                        {p.match.homeTeam.name} x {p.match.awayTeam.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(p.match.kickoffAt).toLocaleDateString("pt-BR", {
                          day: "2-digit", month: "2-digit", year: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </p>
                    </td>
                    <td className="px-5 py-3 text-center font-bold text-gray-800">
                      {p.homeScore} x {p.awayScore}
                    </td>
                    <td className="px-5 py-3 text-center font-bold text-gray-800">
                      {p.match.homeScore} x {p.match.awayScore}
                    </td>
                    <td className="px-5 py-3 text-center">
                      {badgePts(p.points)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs text-gray-400 text-right px-5 py-3">
              {filtrados.length} palpite{filtrados.length !== 1 ? "s" : ""}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
