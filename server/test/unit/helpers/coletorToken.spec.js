import { describe, it, expect } from "vitest";
import {
  gerarToken,
  hashToken,
  montarBat,
} from "../../../controllers/helpers/coletorToken.js";

describe("gerarToken / hashToken", () => {
  it("gera token hex longo e hash consistente", () => {
    const { token, hash } = gerarToken();

    expect(typeof token).toBe("string");
    expect(token.length).toBeGreaterThanOrEqual(48);
    expect(/^[0-9a-f]+$/.test(token)).toBe(true);
    expect(hashToken(token)).toBe(hash);
  });

  it("gera tokens diferentes a cada chamada", () => {
    expect(gerarToken().token).not.toBe(gerarToken().token);
  });
});

describe("montarBat", () => {
  it("injeta a URL, o token e a chamada ao script", () => {
    const bat = montarBat({ apiBase: "https://x/api", token: "abc123" });

    expect(bat).toContain('-ApiBase "https://x/api"');
    expect(bat).toContain('-Token "abc123"');
    expect(bat).toContain("coletar-desktop.ps1");
    expect(bat).toContain("-ExecutionPolicy Bypass");
  });
});
