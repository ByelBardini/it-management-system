import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ModalConfirmacao from "../components/default/ModalConfirmacao.jsx";

describe("ModalConfirmacao", () => {
  it("exibe o texto de confirmação recebido", () => {
    render(
      <ModalConfirmacao
        texto="Deseja excluir o item?"
        onNao={() => {}}
        onSim={() => {}}
      />
    );

    expect(screen.getByText("Confirmação")).toBeInTheDocument();
    expect(screen.getByText("Deseja excluir o item?")).toBeInTheDocument();
  });

  it("chama onSim ao clicar em Confirmar", async () => {
    const onSim = vi.fn();
    render(<ModalConfirmacao texto="x" onNao={() => {}} onSim={onSim} />);

    await userEvent.click(screen.getByRole("button", { name: "Confirmar" }));

    expect(onSim).toHaveBeenCalledTimes(1);
  });
});
