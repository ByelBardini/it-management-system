import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Header from "../components/default/Header.jsx";

function renderizar() {
  render(
    <MemoryRouter>
      <Header />
    </MemoryRouter>
  );
}

describe("Header — inativação de senhas", () => {
  it("não renderiza o link de Senhas no menu de navegação", () => {
    renderizar();

    const linkSenhas = screen.queryByRole("link", { name: "Senhas" });
    expect(linkSenhas).toBeNull();
  });

  it("mantém os demais links de navegação", () => {
    renderizar();

    expect(
      screen.getByRole("link", { name: "Inventário" })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Peças" })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Workstations" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Manutenções" })
    ).toBeInTheDocument();
  });
});
