import Link from "next/link";

export default function Sidebar() {
  return (
    <aside className="min-h-screen p-6 bg-white border-r border-gray-200 w-72">
      <div className="mb-8">
        <h2 className="text-2xl font-bold">Lucro ML</h2>
        <p className="mt-1 text-sm text-gray-500">
          Ferramenta de trabalho para seller
        </p>
      </div>

      <nav className="flex flex-col gap-6">
        <div>
          <p className="mb-3 text-xs font-semibold tracking-wide text-gray-400 uppercase">
            Visão geral
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/dashboard" className="hover:text-blue-600">
              Central de decisão
            </Link>
          </div>
        </div>

        <div>
          <p className="mb-3 text-xs font-semibold tracking-wide text-gray-400 uppercase">
            Lucro e operação
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/dashboard/diagnostico" className="hover:text-blue-600">
              Diagnóstico de lucro
            </Link>
            <Link href="/dashboard/dre" className="hover:text-blue-600">
              Lucro real e DRE
            </Link>
            <Link href="/dashboard/fluxo-caixa" className="hover:text-blue-600">
              Fluxo de caixa
            </Link>
            <Link href="/dashboard/full-vs-flex" className="hover:text-blue-600">
              Full vs Flex
            </Link>
          </div>
        </div>

        <div>
          <p className="mb-3 text-xs font-semibold tracking-wide text-gray-400 uppercase">
            Produtos e oportunidades
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/dashboard/catalogos" className="hover:text-blue-600">
              Catálogos de fornecedor
            </Link>
            <Link href="/dashboard/radar" className="hover:text-blue-600">
              Radar de oportunidades
            </Link>
            <Link href="/dashboard/inteligencia" className="hover:text-blue-600">
              Inteligência de mercado
            </Link>
            <Link href="/dashboard/kits" className="hover:text-blue-600">
              Gerador de kits
            </Link>
          </div>
        </div>

        <div>
          <p className="mb-3 text-xs font-semibold tracking-wide text-gray-400 uppercase">
            Compra e estoque
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/dashboard/simulador" className="hover:text-blue-600">
              Simulador de compra
            </Link>
          </div>
        </div>

        <div>
          <p className="mb-3 text-xs font-semibold tracking-wide text-gray-400 uppercase">
            Ajuda
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/dashboard/ajuda" className="hover:text-blue-600">
              Ajuda para seller
            </Link>
            <Link href="/dashboard/suporte" className="hover:text-blue-600">
              Suporte
            </Link>
          </div>
        </div>
      </nav>
    </aside>
  );
}