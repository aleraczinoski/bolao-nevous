import { useNavigate } from "react-router-dom";

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-6 text-center">
      <p className="text-8xl font-black text-slate-800 select-none leading-none">404</p>
      <h2 className="text-2xl font-black text-white mt-4 mb-2">Página não encontrada</h2>
      <p className="text-slate-500 text-sm mb-8">A página que você procura não existe ou foi movida.</p>

      <img
        className="w-auto max-w-xs max-h-64 object-contain rounded-2xl border border-slate-800 mb-8"
        src="https://res.cloudinary.com/duyyaenxc/image/upload/v1779513485/WhatsApp_Image_2026-05-23_at_02.13.05_nxmbbp.jpg"
        alt="Página Não Encontrada"
      />

      <button
        onClick={() => navigate(-1)}
        className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold transition-colors"
      >
        Voltar
      </button>
    </div>
  );
}
