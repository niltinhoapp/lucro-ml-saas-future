"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { SimulacaoRow } from "@/types/simulacoes";

function getErrorMessage(err: unknown) {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return "Erro ao carregar.";
}

export default function HistoricoPageClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<SimulacaoRow[]>([]);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      setErro("");
      try {
        const res = await fetch("/api/simulacoes", { cache: "no-store" });
        const raw = await res.text();
        const parsed = raw ? (JSON.parse(raw) as unknown) : null;
        if (!res.ok) {
          const apiMsg =
            parsed && typeof parsed === "object" && parsed !== null && "error" in parsed
              ? String((parsed as { error?: unknown }).error ?? "")
              : "";
          throw new Error(apiMsg || "Falha ao carregar histórico.");
        }
        const arr = Array.isArray(parsed) ? (parsed as SimulacaoRow[]) : [];
        if (!alive) return;
        setItems(arr);
      } catch (e: unknown) {
        if (!alive) return;
        setErro(getErrorMessage(e));
        setItems([]);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }
    load();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="page-wrap historico-page">
      <section className="topbar">
        <div>
          <span className="badge">🕒 Histórico</span>
          <h2 style={{ marginTop: 10 }}>Histórico de relatórios</h2>
          <p className="subtitle">Abra qualquer relatório salvo para revisar o resultado.</p>
        </div>
        <div className="actions">
          <button className="btn btn-ghost" onClick={() => router.push("/")}>🏠 Home</button>
          <button className="btn-dark" onClick={() => router.push("/dashboard")}>← Painel</button>
        </div>
      </section>

      {loading ? <div className="alert info">Carregando histórico...</div> : null}
      {erro ? <div className="alert danger">{erro}</div> : null}
      {!loading && !erro && !items.length ? <div className="alert info">Ainda não existem relatórios salvos.</div> : null}

      <div className="catalog-history-grid">
        {items.map((item) => (
          <button
            key={item.id}
            className="card catalog-history-card"
            onClick={() => router.push(`/dashboard/dre?id=${item.id}`)}
          >
            <div className="catalog-history-top">
              <span className="badge pro">DRE</span>
              <span className="small">{item.created_at ? new Date(item.created_at).toLocaleString("pt-BR") : "Sem data"}</span>
            </div>
            <h3>{item.nome || "Relatório"}</h3>
            <p className="subtitle">{item.arquivo_nome || "Arquivo sem nome"}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
