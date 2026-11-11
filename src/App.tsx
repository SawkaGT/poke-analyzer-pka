import React, { useState, useMemo } from 'react';
import {
  Trophy,
  Coins,
  Clock,
  Target,
  TrendingUp,
  Sparkles,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  RotateCcw,
  Swords,
  DollarSign,
  Calculator,
  Flame,
  Hourglass,
  Layers,
  Scale,
  Zap,
  Info,
  Heart,
  Copy,
  Check,
  QrCode,
  ShieldCheck,
  Infinity as InfinityIcon,
} from 'lucide-react';

// Mapeamento dos Tiers e Máximas de Captura (Brokes) - UR removido daqui
const TIERS = {
  T1: {
    name: 'Tier 1 (T1)',
    maxBrokes: 1280,
    description: 'Wildscape',
    isPrimalOnly: false,
  },
  SR: {
    name: 'Super Rare (SR)',
    maxBrokes: 3500,
    description: 'Wildscape',
    isPrimalOnly: false,
  },
};

export default function App() {
  // --- ESTADOS DO PROJETO (HUNT ALVO) ---
  const [projectTier, setProjectTier] = useState('SR');
  const [projectBrokesPerHour, setProjectBrokesPerHour] = useState(70);
  const [projectProfitPerHourK, setProjectProfitPerHourK] = useState(150); // em k (milhar)
  const [costPerBallK, setCostPerBallK] = useState(0.8); // em k (milhar), ex: 0.8k = 800
  const [targetMarketValueKK, setTargetMarketValueKK] = useState(45); // em kk (milhões)

  // --- ESTADOS DA HUNT PRIMAL (FARM DE DINHEIRO) ---
  const [primalProfitPerHourK, setPrimalProfitPerHourK] = useState(600); // em k (milhar)
  const [primalBrokesPerHour, setPrimalBrokesPerHour] = useState(25);
  const [primalTargetTier, setPrimalTargetTier] = useState('UR'); // Tier de longo prazo para comparativo Primal
  const [primalDropValueKK, setPrimalDropValueKK] = useState(180); // Valor de mercado estimado do UR/LG/MT em KK

  // Estado para copiar chave Pix
  const [copiedPix, setCopiedPix] = useState(false);
  const pixKey = 'sawkagt@gmail.com';

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixKey);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2500);
  };

  // Preset Schnell
  const applyPreset = (type) => {
    if (type === 'fast_sr') {
      setProjectTier('SR');
      setProjectBrokesPerHour(70);
      setProjectProfitPerHourK(120);
      setCostPerBallK(0.7);
      setTargetMarketValueKK(35);
      setPrimalProfitPerHourK(550);
      setPrimalBrokesPerHour(20);
      setPrimalTargetTier('UR');
      setPrimalDropValueKK(150);
    } else if (type === 'heavy_t1') {
      setProjectTier('T1');
      setProjectBrokesPerHour(120);
      setProjectProfitPerHourK(200);
      setCostPerBallK(0.5);
      setTargetMarketValueKK(12);
      setPrimalProfitPerHourK(700);
      setPrimalBrokesPerHour(30);
      setPrimalTargetTier('LG');
      setPrimalDropValueKK(450);
    } else if (type === 'high_market') {
      setProjectTier('SR');
      setProjectBrokesPerHour(50);
      setProjectProfitPerHourK(90);
      setCostPerBallK(1.2);
      setTargetMarketValueKK(85);
      setPrimalProfitPerHourK(650);
      setPrimalBrokesPerHour(15);
      setPrimalTargetTier('MT');
      setPrimalDropValueKK(1200);
    }
  };

  // --- CÁLCULOS PRINCIPAIS ---
  const calc = useMemo(() => {
    const tierConfig = TIERS[projectTier] || TIERS.SR;
    const projectMaxBrokes = tierConfig.maxBrokes;

    // 1. Horas Estimadas para a Máxima do Projeto
    const safeProjectBrokesH = Math.max(1, projectBrokesPerHour);
    const projectHours = projectMaxBrokes / safeProjectBrokesH;

    // 2. Financeiro do Projeto
    const projectGrossProfitK = projectHours * projectProfitPerHourK;
    const projectTotalBallCostK = projectMaxBrokes * costPerBallK;
    const projectNetProfitK = projectGrossProfitK - projectTotalBallCostK;

    // Converter valor do pokémon (kk) para k para somar patrimônio
    const targetMarketValueK = targetMarketValueKK * 1000;
    const projectTotalEquityK = projectNetProfitK + targetMarketValueK;
    const projectTotalEquityKK = projectTotalEquityK / 1000;

    // 3. Financeiro da Primal (no mesmo tempo de horas do Projeto)
    const primalGrossProfitK = projectHours * primalProfitPerHourK;
    const primalTotalBrokes = primalBrokesPerHour * projectHours;
    const primalTotalBallCostK = primalTotalBrokes * costPerBallK;
    const primalNetProfitK = primalGrossProfitK - primalTotalBallCostK;
    const primalNetProfitKK = primalNetProfitK / 1000;

    // 4. Comparativo de Curto Prazo
    const shortTermDiffKK = Math.abs(primalNetProfitKK - projectTotalEquityKK);
    const isPrimalBetterShortTerm = primalNetProfitK > projectTotalEquityK;

    // 5. LONGO PRAZO: Projeção de Tiers Superiores (UR, LG, MT) na Primal vs Projetos
    const PRIMAL_TIERS = {
      UR: { maxBrokes: 9400 },
      LG: { maxBrokes: 22535 },
      MT: { maxBrokes: 50000 },
    };
    const primalTierConfig = PRIMAL_TIERS[primalTargetTier] || PRIMAL_TIERS.UR;
    const primalMaxBrokes = primalTierConfig.maxBrokes;
    const safePrimalBrokesH = Math.max(1, primalBrokesPerHour);

    // Tempo para bater a máxima na Primal
    const hoursToPrimalDrop = primalMaxBrokes / safePrimalBrokesH;

    // Quantos projetos completos cabem no tempo de 1 drop Primal
    const projectsInPrimalTime = hoursToPrimalDrop / projectHours;

    // Lucro bruto/líquido de farm na Primal até bater a máxima
    const primalFullFarmGrossK = hoursToPrimalDrop * primalProfitPerHourK;
    const primalFullFarmBallCostK = primalMaxBrokes * costPerBallK;
    const primalFullFarmNetK = primalFullFarmGrossK - primalFullFarmBallCostK;
    const primalFullFarmNetKK = primalFullFarmNetK / 1000;

    // Patrimônio total Primal com o Drop Raro inclusivo
    const primalDropValueK = primalDropValueKK * 1000;
    const primalTotalLongTermEquityKK =
      (primalFullFarmNetK + primalDropValueK) / 1000;

    // Patrimônio obtido fazendo múltiplos Projetos no mesmo tempo total da Primal
    const totalProjectsEquityLongTermKK =
      (projectsInPrimalTime * projectTotalEquityK) / 1000;

    const isPrimalBetterLongTerm =
      primalTotalLongTermEquityKK > totalProjectsEquityLongTermKK;

    return {
      projectMaxBrokes,
      projectHours,
      projectGrossProfitK,
      projectTotalBallCostK,
      projectNetProfitK,
      projectTotalEquityK,
      projectTotalEquityKK,

      primalTotalBrokes,
      primalGrossProfitK,
      primalTotalBallCostK,
      primalNetProfitK,
      primalNetProfitKK,

      shortTermDiffKK,
      isPrimalBetterShortTerm,

      // Longo Prazo
      primalMaxBrokes,
      hoursToPrimalDrop,
      projectsInPrimalTime,
      primalFullFarmNetKK,
      primalTotalLongTermEquityKK,
      totalProjectsEquityLongTermKK,
      isPrimalBetterLongTerm,
    };
  }, [
    projectTier,
    projectBrokesPerHour,
    projectProfitPerHourK,
    costPerBallK,
    targetMarketValueKK,
    primalProfitPerHourK,
    primalBrokesPerHour,
    primalTargetTier,
    primalDropValueKK,
  ]);

  // Formatadores
  const formatK = (val) =>
    `${val.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}k`;
  const formatKK = (val) =>
    `${val.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}kk`;
  const formatHours = (hours) => {
    if (isNaN(hours) || !isFinite(hours)) return 'N/A';
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16 selection:bg-indigo-500 selection:text-white">
      {/* HEADER NAVBAR */}
      <header className="bg-slate-900/90 border-b border-slate-800 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-amber-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Swords className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                PokeAnalyzer{' '}
                <span className="text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-semibold">
                  Projetar vs Primal
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Calculadora de custo de oportunidade & eficiência de caça
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-10">
        {/* SECTION 1: FORMULÁRIO DE ENTRADAS (2 COLUNAS) */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* BLOCO A: HUNT DE PROJETO */}
          <div className="bg-slate-900/80 rounded-2xl border border-indigo-500/30 p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-400">
                  <Target className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="font-bold text-lg text-white">
                    1. Hunt de Projeto (Pokémon Alvo)
                  </h2>
                  <p className="text-xs text-slate-400">
                    Caçar o Pokémon específico para o time
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono bg-indigo-950 text-indigo-300 px-2.5 py-1 rounded-lg border border-indigo-800/50">
                Máxima: {TIERS[projectTier].maxBrokes.toLocaleString()} brokes
              </span>
            </div>

            <div className="space-y-4">
              {/* Tier Selection */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 flex justify-between">
                  <span>Tier do Pokémon Alvo</span>
                  <span className="text-slate-400 text-[11px]">
                    Define a máxima estimada
                  </span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.keys(TIERS).map((tKey) => (
                    <button
                      key={tKey}
                      type="button"
                      onClick={() => setProjectTier(tKey)}
                      className={`py-2 text-xs font-bold rounded-xl border transition ${
                        projectTier === tKey
                          ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/30'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      {tKey}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  {TIERS[projectTier].name}:{' '}
                  <strong className="text-indigo-300">
                    {TIERS[projectTier].description}
                  </strong>
                </p>
              </div>

              {/* Brokes por hora & Lucro por hora */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center justify-between">
                    <span>Brokes por Hora</span>
                    <HelpCircle
                      className="w-3.5 h-3.5 text-slate-500"
                      title="Tentativas de captura por hora"
                    />
                  </label>
                  <input
                    type="number"
                    value={projectBrokesPerHour}
                    onChange={(e) =>
                      setProjectBrokesPerHour(Number(e.target.value))
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-black focus:outline-none focus:border-indigo-500 transition"
                    placeholder="Ex: 70"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center justify-between">
                    <span>Lucro / Hora da Hunt</span>
                    <span className="text-indigo-400 text-[11px]">
                      em k (milhar)
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={projectProfitPerHourK}
                      onChange={(e) =>
                        setProjectProfitPerHourK(Number(e.target.value))
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-3.5 pr-8 py-2.5 text-sm text-black focus:outline-none focus:border-indigo-500 transition"
                      placeholder="Ex: 150"
                    />
                    <span className="absolute right-3.5 top-3 text-slate-500 text-xs font-mono">
                      k/h
                    </span>
                  </div>
                </div>
              </div>

              {/* Custo por Bola & Valor de Mercado */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center justify-between">
                    <span>Custo Médio Pokébola</span>
                    <span className="text-indigo-400 text-[11px]">
                      em k (milhar)
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      value={costPerBallK}
                      onChange={(e) => setCostPerBallK(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-3.5 pr-8 py-2.5 text-sm text-black focus:outline-none focus:border-indigo-500 transition"
                      placeholder="Ex: 0.8 (800$)"
                    />
                    <span className="absolute right-3.5 top-3 text-slate-500 text-xs font-mono">
                      k/bola
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center justify-between">
                    <span>Valor do Pokémon Alvo</span>
                    <span className="text-amber-400 text-[11px]">
                      em kk (milhões)
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.5"
                      value={targetMarketValueKK}
                      onChange={(e) =>
                        setTargetMarketValueKK(Number(e.target.value))
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-3.5 pr-10 py-2.5 text-sm text-black focus:outline-none focus:border-indigo-500 transition"
                      placeholder="Ex: 45"
                    />
                    <span className="absolute right-3.5 top-3 text-slate-500 text-xs font-mono">
                      kk
                    </span>
                  </div>
                </div>
              </div>

              {/* RESUMO RÁPIDO DO PROJETO */}
              <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800/80 space-y-2 mt-4">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">
                    Tempo estimado até a máxima:
                  </span>
                  <span className="font-bold text-indigo-300">
                    {formatHours(calc.projectHours)} (
                    {Math.round(calc.projectHours)}h)
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">
                    Gasto total estimado em balls:
                  </span>
                  <span className="font-semibold text-rose-400">
                    {formatK(calc.projectTotalBallCostK)} (
                    {formatKK(calc.projectTotalBallCostK / 1000)})
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* BLOCO B: HUNT PRIMAL */}
          <div className="bg-slate-900/80 rounded-2xl border border-amber-500/30 p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-500"></div>

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-400">
                  <Flame className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="font-bold text-lg text-white">
                    2. Hunt Primal (Farm de Dinheiro)
                  </h2>
                  <p className="text-xs text-slate-400">
                    Foco em lucro por hora máximo
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono bg-amber-950 text-amber-300 px-2.5 py-1 rounded-lg border border-amber-800/50">
                Tempo pareado: {Math.round(calc.projectHours)}h
              </span>
            </div>

            <div className="space-y-4">
              {/* Lucro Primal & Brokes na Primal */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center justify-between">
                    <span>Lucro / Hora na Primal</span>
                    <span className="text-amber-400 text-[11px]">
                      em k (milhar)
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={primalProfitPerHourK}
                      onChange={(e) =>
                        setPrimalProfitPerHourK(Number(e.target.value))
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-3.5 pr-8 py-2.5 text-sm text-black focus:outline-none focus:border-amber-500 transition"
                      placeholder="Ex: 600"
                    />
                    <span className="absolute right-3.5 top-3 text-slate-500 text-xs font-mono">
                      k/h
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center justify-between">
                    <span>Brokes / Hora na Primal</span>
                    <HelpCircle
                      className="w-3.5 h-3.5 text-slate-500"
                      title="Tentativas de captura em pokémon raros na Primal"
                    />
                  </label>
                  <input
                    type="number"
                    value={primalBrokesPerHour}
                    onChange={(e) =>
                      setPrimalBrokesPerHour(Number(e.target.value))
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-black focus:outline-none focus:border-amber-500 transition"
                    placeholder="Ex: 25"
                  />
                </div>
              </div>

              {/* Separador de Longo Prazo */}
              <div className="pt-2 border-t border-slate-800">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-3">
                  Parâmetros Raros Primal (Para Quadro de Longo Prazo)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Tier Alvo na Primal
                    </label>
                    <select
                      value={primalTargetTier}
                      onChange={(e) => setPrimalTargetTier(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-black focus:outline-none focus:border-amber-500 transition"
                    >
                      <option value="UR">UR - Ultra Rare (9.400 max)</option>
                      <option value="LG">LG - Legendary (22.535 max)</option>
                      <option value="MT">MT - Mythic (50.000 max)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1 flex justify-between">
                      <span>Valor do Pokémon no Market</span>
                      <span className="text-amber-400 text-[11px]">em kk</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={primalDropValueKK}
                        onChange={(e) =>
                          setPrimalDropValueKK(Number(e.target.value))
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-3.5 pr-10 py-2.5 text-sm text-black focus:outline-none focus:border-amber-500 transition"
                        placeholder="Ex: 180"
                      />
                      <span className="absolute right-3.5 top-3 text-slate-500 text-xs font-mono">
                        kk
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* RESUMO RÁPIDO DA PRIMAL */}
              <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800/80 space-y-2 mt-4">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">
                    Total de Brokes Primal em {Math.round(calc.projectHours)}h:
                  </span>
                  <span className="font-semibold text-amber-300">
                    {Math.round(calc.primalTotalBrokes).toLocaleString()} brokes
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">
                    Lucro Líquido sem drop:
                  </span>
                  <span className="font-bold text-emerald-400">
                    {formatKK(calc.primalNetProfitKK)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: QUADRO 1 - ANÁLISE DE CURTO PRAZO */}
        <section className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-2xl relative">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-400">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">
                QUADRO 1: Análise de Curto Prazo
              </h2>
              <p className="text-xs text-slate-400">
                Comparativo direto considerando o mesmo tempo de hunt (
                {Math.round(calc.projectHours)} horas)
              </p>
            </div>
          </div>

          {/* VEREDITO HERO BANNER */}
          <div
            className={`rounded-2xl p-6 border shadow-xl mb-8 relative overflow-hidden transition-all ${
              calc.isPrimalBetterShortTerm
                ? 'bg-gradient-to-r from-amber-950/70 via-slate-900 to-slate-900 border-amber-500/40'
                : 'bg-gradient-to-r from-indigo-950/70 via-slate-900 to-slate-900 border-indigo-500/40'
            }`}
          >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-2">
                <span
                  className={`inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${
                    calc.isPrimalBetterShortTerm
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" /> Veredito de Curto Prazo
                </span>

                <h3 className="text-2xl sm:text-3xl font-black text-white">
                  {calc.isPrimalBetterShortTerm ? (
                    <span className="text-amber-400">
                      É melhor fazer a Hunt Primal!
                    </span>
                  ) : (
                    <span className="text-indigo-400">
                      Vale mais a pena Projetar!
                    </span>
                  )}
                </h3>

                <p className="text-slate-300 text-sm max-w-3xl leading-relaxed">
                  {calc.isPrimalBetterShortTerm ? (
                    <>
                      O dinheiro gerado na Hunt Primal (
                      <strong className="text-amber-300">
                        {formatKK(calc.primalNetProfitKK)}
                      </strong>
                      ) é suficiente para
                      <strong>
                        {' '}
                        comprar o Pokémon Alvo ({targetMarketValueKK}kk)
                      </strong>{' '}
                      no mercado e ainda sobra uma margem líquida de{' '}
                      <strong className="text-emerald-400">
                        {formatKK(calc.shortTermDiffKK)}
                      </strong>
                      !
                    </>
                  ) : (
                    <>
                      Capturar diretamente o Pokémon economiza mais do que
                      comprar no mercado. Ao projetar, você acumula um
                      patrimônio total (Lucro + Pokémon) equivalente a{' '}
                      <strong className="text-indigo-300">
                        {formatKK(calc.projectTotalEquityKK)}
                      </strong>
                      , superando o lucro do farm Primal em{' '}
                      <strong className="text-emerald-400">
                        {formatKK(calc.shortTermDiffKK)}
                      </strong>
                      .
                    </>
                  )}
                </p>
              </div>

              {/* CARD DE DIFERENÇA DESTACADO */}
              <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 text-center shrink-0 w-full md:w-auto">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold block mb-1">
                  Vantagem Financeira
                </span>
                <span className="text-3xl font-black text-emerald-400">
                  +{formatKK(calc.shortTermDiffKK)}
                </span>
                <span className="text-[10px] text-slate-500 block mt-1">
                  Lucro a mais no período
                </span>
              </div>
            </div>
          </div>

          {/* CARDS COMPARATIVOS LADO A LADO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* CARD PROJETO */}
            <div className="bg-slate-950/60 rounded-2xl border border-indigo-500/20 p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="font-bold text-indigo-400 flex items-center gap-2">
                  <Target className="w-4 h-4" /> Opção A: Hunt de Projeto
                </span>
                <span className="text-xs text-slate-400">
                  {Math.round(calc.projectHours)}h de Hunt
                </span>
              </div>

              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Lucro Bruto da Hunt:</span>
                  <span className="text-slate-200">
                    {formatK(calc.projectGrossProfitK)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">
                    Custo Total Pokébolas (
                    {calc.projectMaxBrokes.toLocaleString()} brokes):
                  </span>
                  <span className="text-rose-400">
                    -{formatK(calc.projectTotalBallCostK)}
                  </span>
                </div>
                <div className="flex justify-between font-semibold pt-2 border-t border-slate-800/60">
                  <span className="text-slate-300">
                    Lucro Líquido em Dinheiro:
                  </span>
                  <span className="text-slate-100">
                    {formatK(calc.projectNetProfitK)} (
                    {formatKK(calc.projectNetProfitK / 1000)})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">
                    + Valor Pokémon Capturado:
                  </span>
                  <span className="text-amber-400">
                    +{targetMarketValueKK}kk
                  </span>
                </div>
              </div>

              <div className="p-3.5 bg-indigo-950/40 rounded-xl border border-indigo-800/40 flex justify-between items-center">
                <span className="text-xs font-bold text-indigo-300 uppercase">
                  Patrimônio Total Gerado:
                </span>
                <span className="text-xl font-black text-indigo-200">
                  {formatKK(calc.projectTotalEquityKK)}
                </span>
              </div>
            </div>

            {/* CARD PRIMAL */}
            <div className="bg-slate-950/60 rounded-2xl border border-amber-500/20 p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="font-bold text-amber-400 flex items-center gap-2">
                  <Flame className="w-4 h-4" /> Opção B: Hunt Primal
                </span>
                <span className="text-xs text-slate-400">
                  {Math.round(calc.projectHours)}h de Hunt
                </span>
              </div>

              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Lucro Bruto Primal:</span>
                  <span className="text-slate-200">
                    {formatK(calc.primalGrossProfitK)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">
                    Custo Total Pokébolas (
                    {Math.round(calc.primalTotalBrokes).toLocaleString()}{' '}
                    brokes):
                  </span>
                  <span className="text-rose-400">
                    -{formatK(calc.primalTotalBallCostK)}
                  </span>
                </div>
                <div className="flex justify-between font-semibold pt-2 border-t border-slate-800/60">
                  <span className="text-slate-300">Lucro Líquido Real:</span>
                  <span className="text-emerald-400">
                    {formatKK(calc.primalNetProfitKK)}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Opção de Comprar Alvo ({targetMarketValueKK}kk):</span>
                  <span
                    className={
                      calc.primalNetProfitKK >= targetMarketValueKK
                        ? 'text-emerald-400'
                        : 'text-rose-400'
                    }
                  >
                    {calc.primalNetProfitKK >= targetMarketValueKK
                      ? 'Sobra saldo'
                      : 'Falta saldo'}
                  </span>
                </div>
              </div>

              <div className="p-3.5 bg-amber-950/40 rounded-xl border border-amber-800/40 flex justify-between items-center">
                <span className="text-xs font-bold text-amber-300 uppercase">
                  Patrimônio Total Gerado:
                </span>
                <span className="text-xl font-black text-amber-200">
                  {formatKK(calc.primalNetProfitKK)}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: QUADRO 2 - VISÃO E RETROALIMENTAÇÃO DE LONGO PRAZO */}
        <section className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-500/10 rounded-2xl border border-purple-500/20 text-purple-400">
              <Hourglass className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">
                QUADRO 2: Visão de Longo Prazo & Retroalimentação
              </h2>
              <p className="text-xs text-slate-400">
                Projeção estendida considerando o tempo necessário para pegar um
                Pokémon Tier Superior ({primalTargetTier}) na Primal
              </p>
            </div>
          </div>

          {/* GRID METRICAS DE RETROALIMENTAÇÃO */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Metric 1 */}
            <div className="bg-slate-950/70 p-5 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-xs text-slate-400 uppercase font-semibold flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-purple-400" /> Horas para Máxima
                Primal ({primalTargetTier})
              </span>
              <p className="text-2xl font-black text-white">
                {formatHours(calc.hoursToPrimalDrop)}
              </p>
              <p className="text-[11px] text-slate-400">
                Baseado na máxima do tier selecionado a {primalBrokesPerHour}{' '}
                brokes/h.
              </p>
            </div>

            {/* Metric 2 */}
            <div className="bg-slate-950/70 p-5 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-xs text-slate-400 uppercase font-semibold flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-400" /> Equivalência de
                Projetos
              </span>
              <p className="text-2xl font-black text-indigo-300">
                {calc.projectsInPrimalTime.toFixed(1)} x {projectTier}
              </p>
              <p className="text-[11px] text-slate-400">
                Enquanto você busca 1 {primalTargetTier} na Primal, poderia ter
                concluído{' '}
                <strong className="text-indigo-200">
                  {calc.projectsInPrimalTime.toFixed(1)} projetos
                </strong>{' '}
                de {projectTier}.
              </p>
            </div>

            {/* Metric 3 */}
            <div className="bg-slate-950/70 p-5 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-xs text-slate-400 uppercase font-semibold flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-400" /> Valor Estimado do
                Drop
              </span>
              <p className="text-2xl font-black text-amber-400">
                {primalDropValueKK}kk
              </p>
              <p className="text-[11px] text-slate-400">
                Lucro astronômico direto ao capturar um pokémon tier{' '}
                {primalTargetTier}.
              </p>
            </div>
          </div>

          {/* COMPARATIVO ACUMULADO DE LONGO PRAZO */}
          <div className="p-6 bg-slate-950/90 rounded-2xl border border-purple-500/30 space-y-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              Resultado Final Acumulado em {Math.round(
                calc.hoursToPrimalDrop
              )}{' '}
              Horas de Jogo
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Option Long Term: Projects */}
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-indigo-400 block uppercase">
                  Cenário A: Foco Contínuo em Projetos ({projectTier})
                </span>
                <div className="space-y-1.5 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span>
                      Quantidade de Pokémons {projectTier} capturados:
                    </span>
                    <strong className="text-white">
                      {calc.projectsInPrimalTime.toFixed(1)} un
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Lucro líquido acumulado + Pokémons:</span>
                    <strong className="text-indigo-300">
                      {formatKK(calc.totalProjectsEquityLongTermKK)}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Option Long Term: Primal Drop */}
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-amber-400 block uppercase">
                  Cenário B: Grind Primal até o Drop ({primalTargetTier})
                </span>
                <div className="space-y-1.5 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span>Lucro líquido de farm (sem catch/drop):</span>
                    <span className="text-slate-200">
                      {formatKK(calc.primalFullFarmNetKK)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>
                      Patrimônio Total com o Catch/Drop ({primalDropValueKK}kk):
                    </span>
                    <strong className="text-amber-300">
                      {formatKK(calc.primalTotalLongTermEquityKK)}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {/* LONG TERM VERDICT */}
            <div className="p-4 bg-purple-950/40 border border-purple-800/50 rounded-xl text-xs sm:text-sm text-purple-200 flex items-start gap-3">
              <Info className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white font-bold block mb-1">
                  Conclusão de Estratégia de Longo Prazo:
                </strong>
                {calc.isPrimalBetterLongTerm ? (
                  <span>
                    No longo prazo, o grind Primal focado no Tier{' '}
                    <strong className="text-amber-300">
                      {primalTargetTier}
                    </strong>{' '}
                    supera múltiplos projetos de {projectTier} em cerca de{' '}
                    <strong className="text-emerald-400">
                      {formatKK(
                        calc.primalTotalLongTermEquityKK -
                          calc.totalProjectsEquityLongTermKK
                      )}
                    </strong>
                    . Isso exige resiliência para suportar as{' '}
                    {Math.round(calc.hoursToPrimalDrop)} horas sem o drop
                    garantido até a máxima!
                  </span>
                ) : (
                  <span>
                    A estratégia de múltiplos projetos em{' '}
                    <strong className="text-indigo-300">{projectTier}</strong>{' '}
                    traz um retorno mais seguro e consistente, acumulando mais
                    patrimônio (
                    <strong className="text-indigo-300">
                      {formatKK(calc.totalProjectsEquityLongTermKK)}
                    </strong>
                    ) do que arriscar {Math.round(calc.hoursToPrimalDrop)}h
                    atrás de um único {primalTargetTier} na Primal!
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: APOIO / DOAÇÃO (PIX) */}
        <section className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20 text-amber-400">
              <Heart className="w-6 h-6 text-amber-400 fill-amber-400/20" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Apoie o Projeto</h2>
              <p className="text-xs text-slate-400">
                Ajude a manter a ferramenta no ar e a trazer novas atualizações
                para a comunidade
              </p>
            </div>
          </div>

          {/* GRID DO CARD PIX E MENSAGEM */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* LADO ESQUERDO: QR CODE E CHAVE PIX */}
            <div className="bg-slate-950/80 rounded-2xl border border-slate-800 p-6 flex flex-col justify-between space-y-6 shadow-inner">
              <div className="space-y-2">
                <span className="text-xs font-bold text-amber-400 tracking-wider uppercase flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>{' '}
                  PIX
                </span>
                <p className="text-xs text-slate-300">
                  Escaneie o QR Code no app do seu banco ou copie a chave para
                  fazer sua doação.
                </p>
              </div>

              {/* QR CODE REAL DO SEU BANCO */}
              <div className="flex justify-center my-2">
                <div className="bg-white p-3 rounded-2xl shadow-lg border-2 border-amber-500/30">
                  <div className="w-40 h-40 bg-white rounded-xl flex items-center justify-center overflow-hidden">
                    <img
                      src="./qrcode-pix.png"
                      alt="QR Code Pix do Banco"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              </div>

              {/* CAMPO DA CHAVE PIX COM BOTÃO DE COPIAR */}
              <div className="space-y-2">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Chave Pix (E-mail)
                </span>
                <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200">
                  <span className="font-mono text-xs text-amber-300 truncate mr-2 select-all">
                    {pixKey}
                  </span>
                  <button
                    onClick={handleCopyPix}
                    className="shrink-0 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 p-2 rounded-lg transition flex items-center gap-1 text-xs font-medium"
                    title="Copiar Chave Pix"
                  >
                    {copiedPix ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                    <span className="hidden sm:inline">
                      {copiedPix ? 'Copiado!' : 'Copiar'}
                    </span>
                  </button>
                </div>
                {copiedPix && (
                  <p className="text-[11px] text-emerald-400 font-medium animate-fadeIn">
                    Chave Pix copiada com sucesso para a sua área de
                    transferência!
                  </p>
                )}
              </div>

              <div className="space-y-1 pt-2 border-t border-slate-900 text-slate-400 text-[11px]">
                <p>
                  ☕ Qualquer valor ajuda. O de um cafezinho já faz diferença.
                </p>
                <p>🔒 Doação via PIX. Seguro, rápido e sem cadastro.</p>
              </div>
            </div>

            {/* LADO DIREITO: MENSAGEM DE AGRADECIMENTO */}
            <div className="bg-slate-950/80 rounded-2xl border border-slate-800 p-6 flex flex-col justify-between space-y-6 shadow-inner">
              <div className="space-y-4">
                <span className="text-xs font-bold text-purple-400 tracking-wider uppercase flex items-center gap-1.5">
                  <MessageSquareIcon /> Uma mensagem
                </span>

                <p className="text-sm text-slate-300 leading-relaxed">
                  O <strong>PokeAnalyzer</strong> existe para ajudar a
                  comunidade. Cada contribuição nos motiva a continuar
                  evoluindo, trazendo novas ferramentas e uma experiência cada
                  vez melhor para a comunidade do PKA.
                </p>

                <p className="text-sm text-slate-300">
                  Muito obrigado pelo apoio! ❤️
                </p>

                <p className="text-xs font-semibold text-slate-400 pt-2">
                  — Equipe PokeAnalyzer
                </p>
              </div>

              <div className="p-4 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent rounded-xl border border-amber-500/20">
                <p className="text-base font-black text-amber-400 italic font-serif">
                  "Juntos vamos mais longe!"
                </p>
              </div>
            </div>
          </div>

          {/* RODAPÉ DO RODAPÉ (3 CARDS INFORMATIVOS) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-800">
            <div className="flex items-center space-x-3 bg-slate-950/50 p-3.5 rounded-xl border border-slate-800/60">
              <div className="p-2 bg-pink-500/10 rounded-lg text-pink-400 shrink-0">
                <Heart className="w-4 h-4 fill-pink-400/20" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">
                  100% voluntário
                </h4>
                <p className="text-[11px] text-slate-400">
                  Feito para a comunidade PKA.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 bg-slate-950/50 p-3.5 rounded-xl border border-slate-800/60">
              <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400 shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Transparência</h4>
                <p className="text-[11px] text-slate-400">
                  O apoio será usado para manter o projeto e desenvolver novas
                  ferramentas que a comunidade precisar.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 bg-slate-950/50 p-3.5 rounded-xl border border-slate-800/60">
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 shrink-0">
                <InfinityIcon className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Gratuito!</h4>
                <p className="text-[11px] text-slate-400">
                  As ferramentas são e sempre serão gratuitas. O apoio é
                  totalmente voluntário.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

// Pequeno helper local para ícone de mensagem
function MessageSquareIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-purple-400"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  );
}
