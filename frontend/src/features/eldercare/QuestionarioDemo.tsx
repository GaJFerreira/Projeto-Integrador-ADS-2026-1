import React, { useEffect, useMemo, useState } from "react";
import "./QuestionarioDemo.css";
import { gerarPdfPlano } from "@/lib/gerarPdfPlano";

/* ================================================================
   Config
   ================================================================ */
const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8080";
const USE_SSO =
  (import.meta.env.VITE_USE_PLATFORM_PROFILE ?? "false").toLowerCase() === "true";

async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error((await res.text()) || `HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

/* ================================================================
   Tipos da API de perguntas
   ================================================================ */
type ApiOpcao    = { codigo: string; rotulo: string };
type ApiPergunta = { id: string; slug: string; enunciado: string; tipo: string; ordem: number; opcoes: ApiOpcao[] };
type ApiCategoria = { id: string; titulo: string; emoji: string; perguntas: ApiPergunta[] };
type ApiResponse  = { categorias: ApiCategoria[] };

/* ================================================================
   Demais tipos locais
   ================================================================ */
type Step = "CADASTRO" | "QUESTIONARIO" | "PLANO";
type Sexo = "MASCULINO" | "FEMININO" | "OUTRO";

type Idoso = {
  id: string; // UUID no módulo integrado
  nome: string;
  dataNascimento?: string | null;
  sexo?: Sexo | null;
  email?: string | null;
  telefone?: string | null;
};

type Resposta = { pergunta: string; resposta: string };

type PlanoDiaItem = {
  dia?: string;
  day?: string;
  diaSemana?: string;
  atividades: string[];
  _diaPt?: string;
};

type PlanoExercicio = {
  id?: number | null;
  nivel: string;
  duracaoSemanas: number;
  diasPorSemana: number;
  minutosPorDia: number;
  itens: PlanoDiaItem[];
  _raw?: any;
};

type PlatformProfile = {
  email?: string;
  name?: string;
  birthdate?: string;
  gender?: string;
  phone?: string;
};

/* ================================================================
   Utilitários
   ================================================================ */
function parseJwt(token: string): any | null {
  try {
    const [, p] = token.split(".");
    if (!p) return null;
    return JSON.parse(atob(p.replace(/-/g, "+").replace(/_/g, "/")));
  } catch { return null; }
}

function getPlatformProfileFromStorage(): PlatformProfile | null {
  const raw = localStorage.getItem("elder_profile");
  if (raw) { try { return JSON.parse(raw); } catch {} }
  for (const k of ["id_token", "access_token", "token"]) {
    const t = localStorage.getItem(k);
    if (!t) continue;
    const c = parseJwt(t);
    if (c && (c.email || c.name))
      return { email: c.email, name: c.name ?? [c.given_name, c.family_name].filter(Boolean).join(" "),
               birthdate: c.birthdate ?? c.dob, gender: c.gender ?? c.sexo, phone: c.phone_number ?? c.phone };
  }
  return null;
}

function mapGenderToSexo(g?: string): Sexo | undefined {
  if (!g) return undefined;
  const s = g.toLowerCase();
  if (["male","m","masculino"].includes(s)) return "MASCULINO";
  if (["female","f","feminino"].includes(s)) return "FEMININO";
  return "OUTRO";
}

function toActivitiesArray(src: any): string[] {
  if (!src) return [];
  if (Array.isArray(src))
    return src.map((x) => typeof x === "string" ? x.trim() : x?.nome ?? x?.name ?? JSON.stringify(x)).filter(Boolean);
  if (typeof src === "string") return src.split(/[;\n]/g).map((s) => s.trim()).filter(Boolean);
  return [];
}

const WEEK_ORDER = ["SEGUNDA-FEIRA","TERÇA-FEIRA","QUARTA-FEIRA","QUINTA-FEIRA","SEXTA-FEIRA","SÁBADO","DOMINGO"];

function mapWeekdayPtBr(raw?: string) {
  if (!raw) return "DIA";
  const s = raw.toLowerCase();
  if (s.includes("mon") || s.includes("segunda")) return "Segunda-feira";
  if (s.includes("tue") || s.includes("terca") || s.includes("terça")) return "Terça-feira";
  if (s.includes("wed") || s.includes("quarta")) return "Quarta-feira";
  if (s.includes("thu") || s.includes("quinta")) return "Quinta-feira";
  if (s.includes("fri") || s.includes("sexta")) return "Sexta-feira";
  if (s.includes("sat") || s.includes("sab")) return "Sábado";
  if (s.includes("sun") || s.includes("dom")) return "Domingo";
  return raw;
}

function weekdaySortIndex(pt: string) {
  const i = WEEK_ORDER.indexOf(pt.toUpperCase());
  return i >= 0 ? i : 99;
}

function calcIdade(iso?: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const h = new Date();
  let i = h.getFullYear() - d.getFullYear();
  const m = h.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && h.getDate() < d.getDate())) i--;
  return i;
}

function nivelClass(n: string) {
  const s = (n ?? "").toLowerCase();
  if (s.includes("baixo")) return "nivel-baixo";
  if (s.includes("medio") || s.includes("médio")) return "nivel-medio";
  if (s.includes("alto")) return "nivel-alto";
  return "";
}

function normalizePlano(raw: any): PlanoExercicio {
  const nivel = raw?.nivel ?? raw?.level ?? "personalizado";
  const duracaoSemanas = Number(raw?.duracaoSemanas ?? raw?.weeks ?? raw?.semanas ?? 4) || 4;
  const diasPorSemana  = Number(raw?.diasPorSemana ?? raw?.daysPerWeek ?? raw?.diasSemana ?? 3) || 3;
  const minutosPorDia  = Number(raw?.minutosPorDia ?? raw?.minutesPerDay ?? raw?.minDia ?? 30) || 30;
  const lista = Array.isArray(raw?.itens) ? raw.itens
    : Array.isArray(raw?.items) ? raw.items
    : Array.isArray(raw?.dias)  ? raw.dias : [];
  const itens: PlanoDiaItem[] = lista.map((i: any) => ({
    dia: i?.dia ?? i?.diaSemana ?? i?.day ?? "Dia",
    atividades: toActivitiesArray(i?.atividades ?? i?.exercicios ?? i?.exercises ?? i?.atividade),
  }));
  return { id: raw?.id ?? null, nivel, duracaoSemanas, diasPorSemana, minutosPorDia, itens, _raw: raw };
}

/* ================================================================
   COMPONENTE PRINCIPAL
   ================================================================ */
export default function QuestionarioDemo() {
  const [step, setStep]         = useState<Step>("CADASTRO");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [idosoId, setIdosoId]   = useState<string | null>(null); // UUID
  const [plano, setPlano]       = useState<PlanoExercicio | null>(null);
  const [catIndex, setCatIndex] = useState(0);

  // Dados do questionário vindos da API
  const [categories, setCategories]         = useState<ApiCategoria[]>([]);
  const [loadingPerguntas, setLoadingPerguntas] = useState(true);

  // Cadastro
  const [nome, setNome]                     = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [sexo, setSexo]                     = useState<Sexo>("OUTRO");
  const [email, setEmail]                   = useState("");
  const [telefone, setTelefone]             = useState("");

  // Respostas
  const [answers, setAnswers] = useState<Record<string, string>>({});

  /* ------------------------------------------------------------
     Busca perguntas do backend ao montar
     ------------------------------------------------------------ */
  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${BASE}/api/elden-care/questionario/perguntas`, {
          headers: token ? { "Authorization": `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: ApiResponse = await res.json();
        const cats = data.categorias ?? [];
        setCategories(cats);
        // Inicializa answers com a primeira opção de cada pergunta
        const initial: Record<string, string> = {};
        for (const cat of cats) {
          for (const q of cat.perguntas) {
            if (q.opcoes.length > 0) initial[q.slug] = q.opcoes[0].codigo;
          }
        }
        setAnswers(initial);
      } catch (e) {
        console.error("Erro ao carregar perguntas:", e);
        setError("Não foi possível carregar o questionário. Verifique a conexão com o servidor.");
      } finally {
        setLoadingPerguntas(false);
      }
    })();
  }, []);

  /* SSO */
  useEffect(() => {
    if (!USE_SSO) return;
    (async () => {
      const p = getPlatformProfileFromStorage();
      if (!p?.email) { setStep("CADASTRO"); return; }
      try {
        setLoading(true);
        setNome(p.name ?? ""); setEmail(p.email ?? "");
        if (p.birthdate) setDataNascimento(p.birthdate);
        const sx = mapGenderToSexo(p.gender);
        if (sx) setSexo(sx);
        if (p.phone) setTelefone(p.phone);
        const ensured = await apiPost<Idoso>("/api/elden-care/participantes", {
          nome: p.name ?? "Usuário", nascimento: p.birthdate ?? null,
          sexo: sx ?? "OUTRO",
        });
        setIdosoId(ensured.id); setCatIndex(0); setStep("QUESTIONARIO");
      } catch { setError("Não foi possível usar o login da plataforma. Preencha o cadastro."); setStep("CADASTRO"); }
      finally { setLoading(false); }
    })();
  }, []);

  /* Ações */
  async function handleCadastroSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setLoading(true);
    try {
      const created = await apiPost<Idoso>("/api/elden-care/participantes", {
        nome, nascimento: dataNascimento || null, sexo,
      });
      setIdosoId(created.id); setCatIndex(0); setStep("QUESTIONARIO");
    } catch (err: any) {
      setError(err?.message || "Falha ao salvar cadastro.");
    } finally { setLoading(false); }
  }

  async function handleGerarPlano() {
    if (!idosoId) { setError("Idoso não cadastrado."); return; }
    setLoading(true); setError(null);
    try {
      const respostas: Resposta[] = Object.entries(answers).map(([pergunta, resposta]) => ({ pergunta, resposta }));
      const raw = await apiPost<any>("/api/elden-care/questionario/gerar", { participanteId: idosoId, respostas });
      setPlano(normalizePlano(raw)); setStep("PLANO");
    } catch (err: any) {
      setError(err?.message || "Erro ao gerar plano.");
    } finally { setLoading(false); }
  }

  const totalCats = categories.length;
  const current   = categories[catIndex];
  const isLast    = catIndex === totalCats - 1;

  const planoOrdenado = useMemo(() => {
    if (!plano) return null;
    const itens = (plano.itens ?? [])
      .map((d) => ({ ...d, _diaPt: mapWeekdayPtBr(d.dia ?? d.day ?? d.diaSemana) }))
      .sort((a, b) => weekdaySortIndex(a._diaPt || "") - weekdaySortIndex(b._diaPt || ""));
    return { ...plano, itens };
  }, [plano]);

  const idade = calcIdade(dataNascimento);

  function handleDownloadPdf() {
    if (!planoOrdenado) return;
    gerarPdfPlano({ nome, idade, sexo, nivel: planoOrdenado.nivel,
      duracaoSemanas: planoOrdenado.duracaoSemanas, diasPorSemana: planoOrdenado.diasPorSemana,
      minutosPorDia: planoOrdenado.minutosPorDia, itens: planoOrdenado.itens });
  }

  /* Rótulo do step */
  const stepLabel = step === "CADASTRO" ? "Cadastro"
    : step === "QUESTIONARIO" ? `${current?.titulo ?? "Carregando…"} · ${catIndex + 1}/${totalCats || "?"}`
    : "Plano gerado";

  const stepIndex = step === "CADASTRO" ? 0 : step === "QUESTIONARIO" ? 1 : 2;

  /* ================================================================
     RENDER
     ================================================================ */
  return (
    <div className="qc">
      {/* TOPBAR */}
      <div className="qc-topbar">
        <div className="qc-topbar__steps">
          {["Cadastro", "Questionário", "Plano"].map((s, i) => (
            <div
              key={s}
              className={`qc-step-dot ${i < stepIndex ? "done" : i === stepIndex ? "active" : ""}`}
            />
          ))}
        </div>
        <div className="qc-topbar__label">
          <span>{stepLabel}</span>
          {step === "QUESTIONARIO" && totalCats > 0 && (
            <span style={{ color: "var(--ec-muted)", fontWeight: 400, fontSize: 12 }}>
              {Math.round((catIndex / (totalCats - 1)) * 100)}% concluído
            </span>
          )}
        </div>
      </div>

      {/* BODY */}
      <div className="qc-body">
        {error && (
          <div className="qc-banner warn">⚠️ {error}</div>
        )}
        {USE_SSO && (
          <div className="qc-banner info">ℹ️ Modo SSO ativo.</div>
        )}

        {/* ---- CADASTRO ------------------------------------------ */}
        {step === "CADASTRO" && (
          <div className="qc-card">
            <div className="qc-card__header">
              <h2 className="qc-card__title">Dados do Idoso</h2>
              <p className="qc-card__sub">Preencha as informações para criar o perfil</p>
            </div>

            <form onSubmit={handleCadastroSubmit} className="qc-form" noValidate>
              <div className="qc-field">
                <label className="qc-label" htmlFor="nome">Nome completo</label>
                <input
                  id="nome"
                  className="qc-input"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex.: Maria Souza"
                  autoComplete="name"
                />
              </div>

              <div className="qc-row">
                <div className="qc-field" style={{ gridColumn: "span 1" }}>
                  <label className="qc-label" htmlFor="dataNasc">Data de nascimento</label>
                  <input
                    id="dataNasc"
                    className="qc-input"
                    required
                    type="date"
                    value={dataNascimento}
                    onChange={(e) => setDataNascimento(e.target.value)}
                  />
                </div>

                <div className="qc-field" style={{ gridColumn: "span 1" }}>
                  <label className="qc-label" htmlFor="sexo">Sexo</label>
                  <div className="qc-select-wrap">
                    <select
                      id="sexo"
                      className="qc-input"
                      value={sexo}
                      onChange={(e) => setSexo(e.target.value as Sexo)}
                    >
                      <option value="MASCULINO">Masculino</option>
                      <option value="FEMININO">Feminino</option>
                      <option value="OUTRO">Outro</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="qc-field">
                <label className="qc-label" htmlFor="email">E-mail</label>
                <input
                  id="email"
                  className="qc-input"
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@dominio.com"
                  autoComplete="email"
                />
              </div>

              <div className="qc-field">
                <label className="qc-label" htmlFor="tel">
                  Telefone <span style={{ fontWeight: 400, color: "var(--ec-muted)" }}>(opcional)</span>
                </label>
                <input
                  id="tel"
                  className="qc-input"
                  type="tel"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  placeholder="(62) 99999-0000"
                  autoComplete="tel"
                />
              </div>

              <button className="btn btn-primary" type="submit" disabled={loading} style={{ marginTop: 4 }}>
                {loading ? "Salvando…" : "Continuar →"}
              </button>
            </form>
          </div>
        )}

        {/* ---- QUESTIONÁRIO -------------------------------------- */}
        {step === "QUESTIONARIO" && (
          <div className="qc-card">
            {/* Loading das perguntas */}
            {loadingPerguntas ? (
              <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--ec-muted)" }}>
                Carregando questionário…
              </div>
            ) : (
              <>
                {/* Progresso de categorias */}
                <div className="qc-cat-progress">
                  {categories.map((c, i) => (
                    <div
                      key={c.id}
                      className={`qc-cat-pip ${i < catIndex ? "done" : i === catIndex ? "active" : ""}`}
                    />
                  ))}
                </div>

                {/* Cabeçalho da categoria */}
                {current && (
                  <div className="qc-cat-header">
                    <div className="qc-cat-emoji">{current.emoji}</div>
                    <h3 className="qc-cat-title">{current.titulo}</h3>
                    <span className="qc-cat-count">{catIndex + 1} / {totalCats}</span>
                  </div>
                )}

                {/* Perguntas */}
                {current?.perguntas.map((q) => {
                  const isLongOptions = q.opcoes.some((o) => o.rotulo.length > 12) || q.opcoes.length > 4;
                  return (
                    <div key={q.slug} className="qc-question">
                      <div className="qc-question__label">{q.enunciado}</div>
                      <div className="qc-options">
                        {q.opcoes.map((opt) => (
                          <button
                            key={opt.codigo}
                            type="button"
                            className={`qc-option${answers[q.slug] === opt.codigo ? " selected" : ""}${isLongOptions ? " full-width" : ""}`}
                            onClick={() => setAnswers((a) => ({ ...a, [q.slug]: opt.codigo }))}
                          >
                            {opt.rotulo}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        )}

        {/* ---- PLANO -------------------------------------------- */}
        {step === "PLANO" && planoOrdenado && (
          <div className="qc-card">
            {/* Hero */}
            <div className="plan-hero">
              <div className="plan-hero__title">Seu Plano de Exercícios</div>
              <div className="plan-hero__sub">Personalizado com base nas suas respostas</div>
              <div className={`plan-hero__badge ${nivelClass(planoOrdenado.nivel)}`}>
                Nível {planoOrdenado.nivel}
              </div>
            </div>

            {/* Chips do idoso */}
            <div className="plan-info-row">
              {nome  && <div className="plan-info-chip">👤 {nome}</div>}
              {idade !== null && <div className="plan-info-chip">🎂 {idade} anos</div>}
              {sexo  && (
                <div className="plan-info-chip">
                  {sexo === "MASCULINO" ? "♂" : sexo === "FEMININO" ? "♀" : "⚥"}{" "}
                  {sexo.charAt(0) + sexo.slice(1).toLowerCase()}
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="plan-stats">
              <div className="plan-stat">
                <div className="plan-stat__label">Duração</div>
                <div className="plan-stat__value">{planoOrdenado.duracaoSemanas}<span className="plan-stat__unit"> sem</span></div>
              </div>
              <div className="plan-stat">
                <div className="plan-stat__label">Dias/semana</div>
                <div className="plan-stat__value">{planoOrdenado.diasPorSemana}<span className="plan-stat__unit"> dias</span></div>
              </div>
              <div className="plan-stat">
                <div className="plan-stat__label">Minutos/dia</div>
                <div className="plan-stat__value">{planoOrdenado.minutosPorDia}<span className="plan-stat__unit"> min</span></div>
              </div>
              <div className="plan-stat">
                <div className="plan-stat__label">Total/semana</div>
                <div className="plan-stat__value">
                  {planoOrdenado.diasPorSemana * planoOrdenado.minutosPorDia}
                  <span className="plan-stat__unit"> min</span>
                </div>
              </div>
            </div>

            {/* Cronograma */}
            <div className="plan-schedule">
              <div className="plan-schedule__title">📅 Cronograma semanal</div>
              {planoOrdenado.itens.map((d, idx) => (
                <div key={idx} className="day-card">
                  <div className="day-card__head">
                    <span className="day-card__icon">📘</span>
                    <span className="day-card__name">{d._diaPt}</span>
                  </div>
                  <div className="day-card__body">
                    {(d.atividades ?? []).length > 0
                      ? d.atividades.map((a, i) => (
                          <div key={i} className="day-card__item">{a}</div>
                        ))
                      : <div style={{ color: "var(--ec-muted)", fontSize: 14 }}>Sem atividades</div>
                    }
                  </div>
                </div>
              ))}
            </div>

            {/* Tips */}
            <div className="plan-tips">
              <div className="plan-tips__title">⚠️ Observações importantes</div>
              <div className="plan-tips__item">Inicie com 5–10 min de aquecimento leve.</div>
              <div className="plan-tips__item">Mantenha hidratação e faça pausas quando necessário.</div>
              <div className="plan-tips__item">Se sentir dor, tontura ou falta de ar, interrompa.</div>
              <div className="plan-tips__item">Consulte um profissional antes de iniciar.</div>
            </div>
          </div>
        )}
      </div>

      {/* ---- BARRA DE AÇÕES (FIXA) ----------------------------- */}
      <div className="qc-actions">
        {/* CADASTRO */}
        {step === "CADASTRO" && (
          <span style={{ fontSize: 13, color: "var(--ec-muted)", alignSelf: "center" }}>
            Preencha os dados acima
          </span>
        )}

        {/* QUESTIONÁRIO */}
        {step === "QUESTIONARIO" && (
          <>
            <button
              className="btn btn-ghost"
              onClick={() => catIndex === 0 ? setStep("CADASTRO") : setCatIndex((i) => i - 1)}
              disabled={loading || loadingPerguntas}
            >
              ← Voltar
            </button>

            {!isLast ? (
              <button
                className="btn btn-primary"
                onClick={() => setCatIndex((i) => i + 1)}
                disabled={loading || loadingPerguntas}
              >
                Continuar →
              </button>
            ) : (
              <button
                className="btn btn-primary"
                onClick={handleGerarPlano}
                disabled={loading || loadingPerguntas}
              >
                {loading ? "Gerando…" : "✨ Gerar Plano"}
              </button>
            )}
          </>
        )}

        {/* PLANO */}
        {step === "PLANO" && (
          <>
            <button
              className="btn btn-ghost"
              onClick={() => { setPlano(null); setStep("QUESTIONARIO"); }}
            >
              Refazer
            </button>
            <button
              className="btn btn-ghost"
              onClick={() => { setPlano(null); setIdosoId(null); setStep("CADASTRO"); }}
            >
              Novo
            </button>
            <div className="qc-actions__end">
              <button className="btn btn-primary" onClick={handleDownloadPdf}>
                📄 Baixar PDF
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
