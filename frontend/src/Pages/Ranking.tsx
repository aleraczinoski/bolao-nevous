import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function Ranking() {
  const navigate = useNavigate();

  // Dados falsos (mock) para testar o visual
  const [jogadores] = useState([
    { id: 1, nome: "Fungo", pontos: 145 },
    { id: 2, nome: "Caspinha", pontos: 130 },
    { id: 3, nome: "William", pontos: 115 },
    { id: 4, nome: "Calça Jeans Molhada", pontos: 80 },
    { id: 5, nome: "Canela", pontos: 45 },
  ]);

  return (
    <div className='min-h-screen bg-gray-50 p-6'>
      <div className='max-w-2xl mx-auto'>
        {/* Cabeçalho */}
        <div className='flex justify-between items-center mb-8'>
          <h1 className='text-3xl font-black text-gray-800 tracking-tight'>
            🏆 Ranking Geral
          </h1>
          <button
            onClick={() => navigate("/dashboard")}
            className='text-blue-600 font-bold hover:underline'
          >
            Voltar aos Jogos
          </button>
        </div>

        {/* Lista do Ranking */}
        <div className='bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden flex flex-col'>
          {jogadores.map((jogador, index) => {
            const posicao = index + 1;
            let estiloPosicao = "bg-gray-100 text-gray-600 font-bold"; // Padrão

            // Cores do Pódio
            if (posicao === 1)
              estiloPosicao =
                "bg-yellow-100 text-yellow-700 font-black border-2 border-yellow-400";
            if (posicao === 2)
              estiloPosicao =
                "bg-gray-200 text-gray-700 font-black border-2 border-gray-400";
            if (posicao === 3)
              estiloPosicao =
                "bg-orange-100 text-orange-800 font-black border-2 border-orange-400";

            return (
              <div
                key={jogador.id}
                className='flex items-center justify-between p-5 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors'
              >
                <div className='flex items-center gap-4'>
                  <div
                    className={`w-10 h-10 flex items-center justify-center rounded-full ${estiloPosicao}`}
                  >
                    {posicao}º
                  </div>
                  <span className='font-bold text-gray-800 text-lg'>
                    {jogador.nome}
                  </span>
                </div>

                <div className='text-right'>
                  <span className='text-2xl font-black text-blue-600'>
                    {jogador.pontos}
                  </span>
                  <span className='text-xs text-gray-500 block uppercase tracking-wider font-bold'>
                    pontos
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
