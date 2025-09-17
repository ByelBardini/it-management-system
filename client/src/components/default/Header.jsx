import logoEmpresa from "../../assets/logo-empresa.png";
import { Building2, Undo2, UserRound } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

function NavButton({ children, className = "", to }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `cursor-pointer px-3 py-2 rounded-lg text-sm font-medium
         text-white/70 hover:text-white hover:bg-white/10
         ring-1 ring-transparent transition
         ${isActive ? "bg-white/10 ring-white/15 text-white" : ""} ${className}`
      }
    >
      {children}
    </NavLink>
  );
}

export default function Header() {
  const fotoCaminho = localStorage.getItem("usuario_caminho_foto");

  const navigate = useNavigate();

  function voltar() {
    localStorage.setItem("empresa_nome", "");
    navigate("/empresas", { replace: true });
  }

  return (
    <header className="fixed top-0 left-0 z-50 w-full">
      <div className="w-full bg-white/5 backdrop-blur-2xl ring-1 ring-white/10 shadow-lg">
        <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
          <NavButton to="/app" className="flex items-center gap-2">
            <span className="h-8 w-8">
              <img src={logoEmpresa} alt="Logo" />
            </span>
            <span className="hidden sm:block font-semibold text-white">
              InfraHub
            </span>
          </NavButton>

          <div className="mx-3 hidden h-6 w-px bg-white/10 sm:block" />

          <nav className="hidden md:flex items-center gap-2">
            <NavButton to="/inventario">Inventário</NavButton>
            <NavButton to="/workstations">Workstations</NavButton>
            <NavButton to="/manutencao">Manutenções</NavButton>
            <NavButton to="/senha">Senhas</NavButton>
          </nav>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <NavButton
              to="/config"
              className="hidden sm:inline-flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 ring-1 ring-white/10 text-sm text-white hover:bg-white/10"
            >
              <Building2 className="h-4 w-4" />
              {localStorage.getItem("empresa_nome")}
            </NavButton>

            <NavButton
              to="/perfil"
              className="hidden sm:flex items-center gap-2 rounded-lg bg-white/5 px-2 py-1.5 ring-1 ring-white/10"
            >
              <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-xs font-bold">
                {fotoCaminho ? (
                  <img
                    className="h-10 w-10 object-cover rounded-2xl"
                    src={`${
                      import.meta.env.VITE_API_BASE_URL
                    }/imagem?path=${fotoCaminho}`}
                    alt="Foto do funcionário"
                    loading="lazy"
                  />
                ) : (
                  <UserRound
                    size={82}
                    className="text-white h-8 w-8 object-cover rounded-2xl"
                  />
                )}
              </div>
              <div className="mr-1">
                <div className="text-sm font-medium text-white">
                  {localStorage.getItem("usuario_nome")}
                </div>
                <div className="text-[11px] text-white/60">
                  {localStorage.getItem("usuario_tipo") === "adm"
                    ? "Admin"
                    : "Usuário"}
                </div>
              </div>
            </NavButton>

            <button
              onClick={voltar}
              className="cursor-pointer inline-flex h-10 w-10 items-center justify-center rounded-lg
                         bg-white/5 ring-1 ring-white/10 hover:bg-white/10"
              aria-label="Sair"
              title="Sair"
            >
              <Undo2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
