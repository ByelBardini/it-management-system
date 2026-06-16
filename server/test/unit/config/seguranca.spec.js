import { describe, it, expect } from "vitest";
import {
  validarAmbiente,
  origemPermitida,
  opcoesCookie,
  extrairToken,
  origemConfiavel,
} from "../../../config/seguranca.js";

const CHAVE_32 = "12345678901234567890123456789012"; // exatamente 32 chars

describe("seguranca", () => {
  describe("validarAmbiente", () => {
    it("aceita ambiente com segredos corretos", () => {
      const env = { SECRET_KEY_LOGIN: "x", SECRET_KEY_PASSWORD: CHAVE_32 };
      expect(validarAmbiente(env)).toBe(true);
    });

    it("rejeita chave de criptografia fora de 32 caracteres", () => {
      const env = {
        SECRET_KEY_LOGIN: "x",
        SECRET_KEY_PASSWORD: CHAVE_32.slice(0, 31),
      };
      expect(() => validarAmbiente(env)).toThrow();
    });

    it("rejeita ausência do segredo de login", () => {
      const env = { SECRET_KEY_PASSWORD: CHAVE_32 };
      expect(() => validarAmbiente(env)).toThrow();
    });
  });

  describe("origemPermitida", () => {
    it("permite origem presente na lista", () => {
      expect(origemPermitida("https://app.x", ["https://app.x"])).toBe(true);
    });

    it("permite requisição sem origin (same-origin / health)", () => {
      expect(origemPermitida(undefined, ["https://app.x"])).toBe(true);
    });

    it("bloqueia origem fora da lista", () => {
      expect(origemPermitida("https://evil.x", ["https://app.x"])).toBe(false);
    });
  });

  describe("opcoesCookie", () => {
    it("gera cookie seguro em produção", () => {
      expect(opcoesCookie(true)).toEqual({
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        path: "/",
        maxAge: 8 * 60 * 60 * 1000,
      });
    });

    it("gera cookie sem secure em dev", () => {
      expect(opcoesCookie(false)).toMatchObject({
        httpOnly: true,
        secure: false,
        sameSite: "strict",
      });
    });
  });

  describe("extrairToken", () => {
    it("extrai o token do cookie", () => {
      const req = { cookies: { token: "abc" }, headers: {} };
      expect(extrairToken(req)).toBe("abc");
    });

    it("faz fallback para o header Authorization", () => {
      const req = { cookies: {}, headers: { authorization: "Bearer abc" } };
      expect(extrairToken(req)).toBe("abc");
    });

    it("retorna null quando não há token", () => {
      const req = { cookies: {}, headers: {} };
      expect(extrairToken(req)).toBeNull();
    });
  });

  describe("origemConfiavel", () => {
    it("aceita método de leitura sem checagem", () => {
      expect(origemConfiavel({ method: "GET", headers: {} }, [])).toBe(true);
    });

    it("aceita mutação de origem confiável", () => {
      const req = { method: "POST", headers: { origin: "https://app.x" } };
      expect(origemConfiavel(req, ["https://app.x"])).toBe(true);
    });

    it("bloqueia mutação de origem não confiável", () => {
      const req = { method: "POST", headers: { origin: "https://evil.x" } };
      expect(origemConfiavel(req, ["https://app.x"])).toBe(false);
    });
  });
});
