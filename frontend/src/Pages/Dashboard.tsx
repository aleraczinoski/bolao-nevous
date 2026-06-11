import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import type { Match, Prediction } from "../types/api";

interface PredictionInput {
  home: string;
  away: string;
}

type SaveState = "idle" | "saving" | "saved" | "error";

const CACHE_MATCHES = "bolao:matches";
const CACHE_PREDS = "bolao:predictions";

function buildPredMaps(preds: Prediction[]) {
  const mapa: Record<string, Prediction> = {};
  const inputsMapa: Record<string, PredictionInput> = {};
  preds.forEach((p) => {
    mapa[p.matchId] = p;
    inputsMapa[p.matchId] = { home: String(p.homeScore), away: String(p.awayScore) };
  });
  return { mapa, inputsMapa };
}

export function Dashboard() {
  const [jogos, setJogos] = useState<Match[]>([]);
  const [palpites, setPalpites] = useState<Record<string, Prediction>>({});
  const [inputs, setInputs] = useState<Record<string, PredictionInput>>({});
  const [saveStates, setSaveStates] = useState<Record<string, SaveState>>({});
  const [carregando, setCarregando] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Mostra cache imediatamente se disponível
    const cachedMatches = sessionStorage.getItem(CACHE_MATCHES);
    const cachedPreds = sessionStorage.getItem(CACHE_PREDS);
    if (cachedMatches && cachedPreds) {
      const matches: Match[] = JSON.parse(cachedMatches);
      const preds: Prediction[] = JSON.parse(cachedPreds);
      setJogos(matches.filter((m) => m.status === "SCHEDULED"));
      const { mapa, inputsMapa } = buildPredMaps(preds);
      setPalpites(mapa);
      setInputs(inputsMapa);
      setCarregando(false);
    }

    // Busca dados frescos em segundo plano
    async function carregar() {
      try {
        const [matchesRes, predsRes] = await Promise.all([
          api.get<Match[]>("/matches"),
          api.get<Prediction[]>("/predictions/me"),
        ]);

        sessionStorage.setItem(CACHE_MATCHES, JSON.stringify(matchesRes.data));
        sessionStorage.setItem(CACHE_PREDS, JSON.stringify(predsRes.data));

        setJogos(matchesRes.data.filter((m) => m.status === "SCHEDULED"));
        const { mapa, inputsMapa } = buildPredMaps(predsRes.data);
        setPalpites(mapa);
        setInputs(inputsMapa);
      } catch (erro) {
        console.error("Erro ao carregar dados:", erro);
      } finally {
        setCarregando(false);
      }
    }

    carregar();
  }, []);

  function handleInput(matchId: string, side: "home" | "away", value: string) {
    setInputs((prev) => ({
      ...prev,
      [matchId]: { ...prev[matchId], [side]: value },
    }));
  }

  async function salvarPalpite(matchId: string) {
    const input = inputs[matchId];
    if (input?.home === "" || input?.away === "") return;

    const homeScore = parseInt(input.home, 10);
    const awayScore = parseInt(input.away, 10);

    if (isNaN(homeScore) || isNaN(awayScore)) return;

    setSaveStates((prev) => ({ ...prev, [matchId]: "saving" }));

    try {
      const palpiteExistente = palpites[matchId];

      if (palpiteExistente) {
        const { data } = await api.put<Prediction>(
          `/predictions/${palpiteExistente.id}`,
          { homeScore, awayScore },
        );
        setPalpites((prev) => ({ ...prev, [matchId]: data }));
      } else {
        const { data } = await api.post<Prediction>("/predictions", {
          matchId,
          homeScore,
          awayScore,
        });
        setPalpites((prev) => ({ ...prev, [matchId]: data }));
      }

      // Invalida cache de predictions para próxima visita buscar dados frescos
      sessionStorage.removeItem(CACHE_PREDS);

      setSaveStates((prev) => ({ ...prev, [matchId]: "saved" }));
      setTimeout(() => {
        setSaveStates((prev) => ({ ...prev, [matchId]: "idle" }));
      }, 2000);
    } catch (err: any) {
      setSaveStates((prev) => ({ ...prev, [matchId]: "error" }));
      setTimeout(() => {
        setSaveStates((prev) => ({ ...prev, [matchId]: "idle" }));
      }, 3000);
    }
  }

  const jogosAgrupados = jogos.reduce(
    (grupos, jogo) => {
      const dataFormatada = new Date(jogo.kickoffAt).toLocaleDateString(
        "pt-BR",
        { day: "2-digit", month: "2-digit", year: "numeric" },
      );
      if (!grupos[dataFormatada]) grupos[dataFormatada] = [];
      grupos[dataFormatada].push(jogo);
      return grupos;
    },
    {} as Record<string, Match[]>,
  );

  function labelBotao(matchId: string) {
    const s = saveStates[matchId] ?? "idle";
    if (s === "saving") return "Salvando...";
    if (s === "saved") return "Salvo!";
    if (s === "error") return "Erro ao salvar";
    return palpites[matchId] ? "Atualizar Palpite" : "Salvar Palpite";
  }

  function corBotao(matchId: string) {
    const s = saveStates[matchId] ?? "idle";
    if (s === "saved") return "bg-green-600 hover:bg-green-700";
    if (s === "error") return "bg-red-600 hover:bg-red-700";
    return "bg-blue-600 hover:bg-blue-700";
  }

  return (
    <div className='min-h-screen bg-gray-50 p-6'>
      <div className='max-w-7xl mx-auto'>
        <div className='flex justify-between items-center mb-10'>
          <button
            onClick={() => navigate("/ranking")}
            className='bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl font-bold shadow-sm hover:bg-gray-100 transition-colors flex items-center gap-2'
          >
            🏆 <span className='hidden sm:inline'>Ranking</span>
          </button>

          <h1 className='text-2xl md:text-3xl font-black text-blue-600 tracking-tighter text-center'>
            BOLÃO<span className='text-gray-800'> NEVOUS</span> ❄️
          </h1>

          <button
            onClick={() => navigate("/profile")}
            className='bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl font-bold shadow-sm hover:bg-gray-100 transition-colors flex items-center gap-2'
          >
            <span className='hidden sm:inline'>Perfil</span> 👤
          </button>
        </div>

        {carregando ? (
          <div className='flex flex-col gap-10 animate-pulse'>
            {[1, 2].map((diaVazio) => (
              <div key={diaVazio} className='flex flex-col gap-4'>
                <div className='h-6 bg-gray-300 rounded w-48 mx-auto mb-2'></div>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                  {[1, 2, 3].map((cardVazio) => (
                    <div
                      key={cardVazio}
                      className='border rounded-xl p-5 shadow-sm bg-white flex flex-col items-center'
                    >
                      <div className='h-4 bg-gray-200 rounded w-16 mb-6'></div>
                      <div className='flex w-full items-center justify-between mb-6 px-4'>
                        <div className='flex flex-col items-center w-1/3'>
                          <div className='w-12 h-12 bg-gray-200 rounded-full mb-2'></div>
                          <div className='h-4 bg-gray-200 rounded w-16'></div>
                        </div>
                        <div className='flex items-center gap-3 w-1/3 justify-center'>
                          <div className='w-12 h-12 bg-gray-200 rounded-lg'></div>
                          <span className='text-gray-200 font-bold'>X</span>
                          <div className='w-12 h-12 bg-gray-200 rounded-lg'></div>
                        </div>
                        <div className='flex flex-col items-center w-1/3'>
                          <div className='w-12 h-12 bg-gray-200 rounded-full mb-2'></div>
                          <div className='h-4 bg-gray-200 rounded w-16'></div>
                        </div>
                      </div>
                      <div className='w-full h-12 bg-gray-200 rounded-lg'></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className='flex flex-col gap-10'>
            {Object.keys(jogosAgrupados).map((data) => (
              <div key={data} className='flex flex-col gap-4'>
                <h2 className='text-xl font-bold text-gray-800 border-b-2 border-gray-200 pb-2 text-center'>
                  Jogos do dia {data}
                </h2>

                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                  {jogosAgrupados[data].map((jogo) => {
                    const input = inputs[jogo.id] ?? { home: "", away: "" };
                    const salvando = saveStates[jogo.id] === "saving";

                    return (
                      <div
                        key={jogo.id}
                        className='border rounded-xl p-4 sm:p-5 shadow-lg bg-white flex flex-col items-center'
                      >
                        <p className='text-xs text-gray-400 mb-4 font-bold uppercase tracking-wider'>
                          {new Date(jogo.kickoffAt).toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>

                        <div className='flex w-full items-center justify-between mb-5'>
                          <div className='flex flex-col items-center w-[38%] text-center gap-1'>
                            <img
                              src={jogo.homeTeam.crestUrl}
                              alt={jogo.homeTeam.name}
                              className='w-10 h-10 sm:w-12 sm:h-12 object-contain'
                            />
                            <span className='font-semibold text-xs sm:text-sm leading-tight line-clamp-2'>
                              {jogo.homeTeam.name}
                            </span>
                          </div>

                          <div className='flex items-center gap-1 sm:gap-2 w-[24%] justify-center'>
                            <input
                              type='number'
                              min={0}
                              className='w-9 h-10 sm:w-11 sm:h-11 border-2 rounded text-center text-base sm:text-lg font-bold bg-gray-50 focus:border-blue-500 outline-none'
                              value={input.home}
                              onChange={(e) =>
                                handleInput(jogo.id, "home", e.target.value)
                              }
                            />
                            <span className='text-gray-400 font-bold text-sm'>x</span>
                            <input
                              type='number'
                              min={0}
                              className='w-9 h-10 sm:w-11 sm:h-11 border-2 rounded text-center text-base sm:text-lg font-bold bg-gray-50 focus:border-blue-500 outline-none'
                              value={input.away}
                              onChange={(e) =>
                                handleInput(jogo.id, "away", e.target.value)
                              }
                            />
                          </div>

                          <div className='flex flex-col items-center w-[38%] text-center gap-1'>
                            <img
                              src={jogo.awayTeam.crestUrl}
                              alt={jogo.awayTeam.name}
                              className='w-10 h-10 sm:w-12 sm:h-12 object-contain'
                            />
                            <span className='font-semibold text-xs sm:text-sm leading-tight line-clamp-2'>
                              {jogo.awayTeam.name}
                            </span>
                          </div>
                        </div>

                        <button
                          disabled={salvando}
                          onClick={() => salvarPalpite(jogo.id)}
                          className={`w-full text-white py-3 rounded-lg font-bold transition-colors ${corBotao(jogo.id)}`}
                        >
                          {labelBotao(jogo.id)}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
