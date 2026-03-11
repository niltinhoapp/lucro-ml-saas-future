"use client";

import { useMemo, useState } from "react";
import { createMarketAnalysis } from "@/lib/market/mock";

export default function RaioXLeadMagnet() {
  const [query, setQuery] = useState("escova secadora profissional");
  const analysis = useMemo(() => createMarketAnalysis(query), [query]);

  return (
    <div className="page">
      <section className="hero seller-home-hero">
        <div className="hero-inner">
          <div>
            <div className="hero-badge">
              <span className="dot" /> Raio-X grátis para seller
            </div>

            <h1>Veja em minutos se esse produto merece sua atenção</h1>

            <p>
              Gere uma leitura rápida de oportunidade para entender preço,
              concorrência, saturação e potencial antes de entrar mais forte
              em um produto.
            </p>

            <div className="market-search-row" style={{ marginTop: 18 }}>
              <input
                className="market-input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Digite um produto"
              />
              <button className="btn btn-primary" type="button">
                Gerar raio-X
              </button>
            </div>

            <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <a className="btn" href="/auth/register">
                Criar conta grátis
              </a>
              <a className="btn btn-ghost" href="/checkout">
                Ver plano PRO
              </a>
            </div>
          </div>

          <div className="feature">
            <div className="t">Leitura rápida com valor real</div>
            <div className="d">
              Mostre ao seller um primeiro diagnóstico útil e leve ele para o
              fluxo completo do Lucro ML.
            </div>
          </div>
        </div>
      </section>

      <section className="market-grid-2">
        <div className="card card-premium market-share-card">
          <span className="badge pro">Raio-X gerado</span>

          <h2>{analysis.query}</h2>

          <div className="market-share-score">{analysis.opportunityScore}/100</div>

          <div className="market-share-grid">
            <div>
              <strong>Preço médio</strong>
              <span>R$ {analysis.avgPrice.toFixed(2)}</span>
            </div>
            <div>
              <strong>Anúncios ativos</strong>
              <span>{analysis.activeAds}</span>
            </div>
            <div>
              <strong>Saturação</strong>
              <span>{analysis.saturation}</span>
            </div>
            <div>
              <strong>Tendência</strong>
              <span>{analysis.trend}</span>
            </div>
          </div>

          <div className="alert success">
            Leitura rápida gerada para ajudar o seller a decidir com mais contexto
            antes de comprar, anunciar ou testar esse produto.
          </div>
        </div>

        <div className="card card-premium">
          <h2>O que você libera no PRO</h2>

          <div className="market-summary-list">
            <div className="alert info">
              Diagnóstico de lucro para descobrir onde sua margem está vazando.
            </div>
            <div className="alert info">
              Gerador de kits para criar ofertas mais fortes e aumentar ticket médio.
            </div>
            <div className="alert info">
              Simulador de compra para validar estoque antes de investir.
            </div>
            <div className="alert success">
              Fluxo completo para analisar, decidir e vender com mais clareza.
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <a href="/checkout" className="btn btn-primary">
              Conhecer o PRO
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}