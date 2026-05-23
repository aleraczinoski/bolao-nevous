import { useNavigate } from "react-router-dom";

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className='min-h-screen bg-gray-50 flex flex-col justify-center items-center p-6 text-center'>
      <h1 className='text-8xl font-black text-gray-200 select-none'>404</h1>

      <div className='mt-4 mb-10 flex flex-col items-center'>
        <h2 className='text-3xl font-bold text-gray-800 mb-2'>
          Ops! Página não encontrada
        </h2>
        <img
          className='w-auto max-w-full max-h-[40vh] md:max-h-[50vh] object-contain rounded-lg shadow-lg'
          src='https://res.cloudinary.com/duyyaenxc/image/upload/v1779513485/WhatsApp_Image_2026-05-23_at_02.13.05_nxmbbp.jpg'
          alt='Página Não Encontrada'
        />
      </div>

      <div className='flex flex-col gap-4'>
        <button
          onClick={() => navigate(-1)}
          className='bg-blue-600 text-white px-10 py-3 rounded-xl font-bold text-lg hover:bg-blue-700 active:scale-[0.98] transition-all shadow-lg shadow-blue-200'
        >
          Voltar à Página Anterior
        </button>
      </div>
    </div>
  );
}
