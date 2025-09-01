import predios from "../assets/predios.jpg";
import logo from "../assets/logo-empresa.png";

export default function Login() {
  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <img
        src={predios}
        alt="Prédio"
        className="absolute inset-0 w-full h-full object-cover"
      />

      <div className="absolute inset-0 bg-gradient-to-r from-[#0A1633]/90 via-[#0A1633]/60 to-[#0A1633]/20"></div>

      <div className="relative z-10 flex items-center justify-start h-full px-20 shadow-xl">
        <div className="bg-[#14295c]/80 backdrop-blur-md text-white rounded-xl w-[400px] p-10 shadow-lg">
          <div className="flex justify-center mb-6">
            <img src={logo} alt="Logo da empresa" className="h-25" />
          </div>

          <h1 className="text-3xl font-bold mb-6 text-center">InfraHub</h1>

          <form className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="Login"
              className="p-3 rounded-md bg-[#0F1A36] border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="password"
              placeholder="Senha"
              className="p-3 rounded-md bg-[#0F1A36] border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              className="cursor-pointer mt-4 bg-blue-600 hover:bg-blue-700 transition-colors p-3 rounded-md font-semibold"
            >
              Entrar
            </button>
          </form>

          <div className="mt-4 text-sm text-center">
            <p className="text-blue-400 cursor-default">
              para conseguir seu login fale com o setor de TI
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
