import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import type { Prediction } from "../types/api";
import { NavBar } from "../components/NavBar";

function badgePontos(pts: number): { label: string; cls: string } {
  if (pts === 0) return { label: "Errou", cls: "bg-slate-800 text-slate-500 border border-slate-700" };
  if (pts === 1) return { label: "Resultado", cls: "bg-slate-700 text-slate-300 border border-slate-600" };
  if (pts === 2) return { label: "+Perdedor", cls: "bg-amber-500/20 text-amber-400 border border-amber-500/30" };
  if (pts === 3) return { label: "+Diferença", cls: "bg-orange-500/20 text-orange-400 border border-orange-500/30" };
  if (pts === 4) return { label: "+Vencedor", cls: "bg-blue-500/20 text-blue-400 border border-blue-500/30" };
  if (pts === 5) return { label: "+Vencedor+Gol", cls: "bg-purple-500/20 text-purple-400 border border-purple-500/30" };
  if (pts === 6) return { label: "Placar Exato!", cls: "bg-green-500/20 text-green-400 border border-green-500/30" };
  if (pts === 7) return { label: "Exato+Goleada!", cls: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" };
  return { label: `${pts} pts`, cls: "bg-blue-500/20 text-blue-400 border border-blue-500/30" };
}

export function Profile() {
  const navigate = useNavigate();
  const { user, signOut, updateUser } = useAuth();
  const [historico, setHistorico] = useState<Prediction[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [editandoNome, setEditandoNome] = useState(false);
  const [novoNome, setNovoNome] = useState("");
  const [salvandoNome, setSalvandoNome] = useState(false);
  const [erroNome, setErroNome] = useState<string | null>(null);

  useEffect(() => {
    const cached = sessionStorage.getItem("bolao:predictions");
    if (cached) {
      setHistorico(JSON.parse(cached));
      setCarregando(false);
    }

    api
      .get<Prediction[]>("/predictions/me")
      .then((res) => {
        sessionStorage.setItem("bolao:predictions", JSON.stringify(res.data));
        setHistorico(res.data);
      })
      .catch(console.error)
      .finally(() => setCarregando(false));
  }, []);

  function handleLogout() {
    signOut();
    navigate("/");
  }

  function iniciarEdicaoNome() {
    setNovoNome(user?.displayName ?? "");
    setErroNome(null);
    setEditandoNome(true);
  }

  async function salvarNome() {
    if (!novoNome.trim()) return;
    setSalvandoNome(true);
    setErroNome(null);
    try {
      const res = await api.patch<{ accessToken: string; user: import("../types/api").User }>("/auth/me", {
        displayName: novoNome.trim(),
      });
      updateUser(res.data.accessToken, res.data.user);
      setEditandoNome(false);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setErroNome(e?.response?.data?.message ?? "Erro ao salvar nome.");
    } finally {
      setSalvandoNome(false);
    }
  }

  const totalPontos = historico.reduce((acc, p) => acc + (p.points ?? 0), 0);
  const finalizados = historico.filter((p) => p.match.status === "FINISHED");
  const acertos = finalizados.filter((p) => (p.points ?? 0) > 0).length;
  const taxa = finalizados.length > 0 ? Math.round((acertos / finalizados.length) * 100) : 0;

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-950 pb-24 md:pb-8">
      <main className="max-w-3xl mx-auto px-4 pt-6">
        {/* Hero card */}
        <div className="relative bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 mb-6 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.1)_0%,_transparent_70%)]" />
          <div className="relative flex items-center justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl mb-3">
                {user.displayName[0]?.toUpperCase()}
              </div>
              {editandoNome ? (
                <div className="mt-1">
                  <input
                    autoFocus
                    value={novoNome}
                    onChange={(e) => setNovoNome(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") salvarNome(); if (e.key === "Escape") setEditandoNome(false); }}
                    disabled={salvandoNome}
                    maxLength={50}
                    className="bg-white/20 text-white font-black text-lg rounded-lg px-3 py-1 outline-none border border-white/40 w-full placeholder-white/50 disabled:opacity-60"
                  />
                  {erroNome && <p className="text-red-300 text-xs mt-1 font-semibold">{erroNome}</p>}
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={salvarNome}
                      disabled={salvandoNome || !novoNome.trim()}
                      className="text-xs font-bold bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {salvandoNome ? "Salvando..." : "Salvar"}
                    </button>
                    <button
                      onClick={() => setEditandoNome(false)}
                      disabled={salvandoNome}
                      className="text-xs font-bold text-white/60 hover:text-white px-2 py-1 rounded-lg transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 mt-1">
                  <h2 className="text-xl font-black text-white">{user.displayName}</h2>
                  <button
                    onClick={iniciarEdicaoNome}
                    title="Editar nome"
                    className="text-white/50 hover:text-white transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
                    </svg>
                  </button>
                </div>
              )}
              <p className="text-blue-200 text-sm">{user.email}</p>
            </div>
            <div className="text-right">
              <p className="text-5xl font-black text-white leading-none">{totalPontos}</p>
              <p className="text-xs uppercase font-bold text-blue-200 tracking-wider mt-1">pontos totais</p>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
            <p className="text-2xl font-black text-white">{historico.length}</p>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Palpites</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
            <p className="text-2xl font-black text-emerald-400">{acertos}</p>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Acertos</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
            <p className="text-2xl font-black text-blue-400">{taxa}%</p>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Taxa</p>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Histórico de Palpites</h3>
          <button onClick={() => navigate("/dashboard")} className="hidden md:block text-slate-500 hover:text-slate-300 text-sm font-semibold transition-colors">
            ← Voltar
          </button>
        </div>

        {carregando ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl h-20 animate-pulse" />
            ))}
          </div>
        ) : historico.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center">
            <p className="text-3xl mb-3">📋</p>
            <p className="text-slate-400 font-semibold">Você ainda não fez nenhum palpite.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {historico.map((item) => {
              const { match } = item;
              const encerrado = match.status === "FINISHED";
              const resultadoReal =
                encerrado && match.homeScore != null ? `${match.homeScore} × ${match.awayScore}` : null;
              const badge = encerrado && item.points != null ? badgePontos(item.points) : null;

              return (
                <div
                  key={item.id}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <img src={match.homeTeam.crestUrl} alt="" className="w-5 h-5 object-contain" />
                      <span className="text-white text-sm font-semibold truncate">{match.homeTeam.name}</span>
                      <span className="text-slate-600 text-xs font-black">x</span>
                      <span className="text-white text-sm font-semibold truncate">{match.awayTeam.name}</span>
                      <img src={match.awayTeam.crestUrl} alt="" className="w-5 h-5 object-contain" />
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                      <span>
                        Palpite: <strong className="text-slate-300">{item.homeScore} × {item.awayScore}</strong>
                      </span>
                      {resultadoReal && (
                        <span>
                          Oficial: <strong className="text-slate-300">{resultadoReal}</strong>
                        </span>
                      )}
                    </div>
                  </div>

                  {badge ? (
                    <div className="shrink-0 flex flex-col items-center gap-1">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${badge.cls}`}>
                        {badge.label}
                      </span>
                      <span className="text-xs text-slate-600 font-bold">{item.points} pts</span>
                    </div>
                  ) : !encerrado ? (
                    <span className="shrink-0 text-xs text-slate-600 font-bold bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
                      Pendente
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-10 pt-6 border-t border-slate-800 text-center">
          <button
            onClick={handleLogout}
            className="text-red-500 hover:text-red-400 font-bold text-sm transition-colors"
          >
            Sair da Conta
          </button>
        </div>
      </main>

      <NavBar />
    </div>
  );
}
