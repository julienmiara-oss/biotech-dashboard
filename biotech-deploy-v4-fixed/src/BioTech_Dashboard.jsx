import { useState, useMemo } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart, LineChart, Line } from "recharts";
import { Building2, Users, FlaskConical, Wallet, TrendingUp, TrendingDown, Settings, Plus, Trash2, Check, X, DollarSign, Euro, Calendar, AlertTriangle, ChevronDown, ChevronRight, Edit3, ArrowUpRight, Cloud, CloudOff, Loader2, Upload, FileSpreadsheet, Download, Copy, Eye, EyeOff, Calculator } from "lucide-react";
import { useSharedState } from "./useSharedState";

const MONTHS_FR = ["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"];
const YEARS = [2026, 2027, 2028];
const TOTAL_MONTHS = 36;
const DEPTS = ["Direction","R&D","Réglementaire","Finance/Admin","Commercial","Production","Qualité","Autre"];
const CONTRACTS = ["CDI","CDD","Freelance","Stage","Alternance"];
const STATUSES = ["Actif","Planifié","Terminé"];
const ENTITY_TYPES = ["Société mère","Filiale","Joint-Venture","Partenariat","Autre"];
const COLORS = ["#2E5090","#27AE60","#8E44AD","#E74C3C","#F39C12","#1ABC9C","#E67E22","#3498DB"];
const ENT_COLORS = ["#2E5090","#27AE60","#8E44AD","#E74C3C","#F39C12","#1ABC9C","#E67E22","#3498DB","#34495E","#16A085"];

const generateMonthLabels = () => {
  const labels = [];
  for (let y = 0; y < YEARS.length; y++) {
    for (let m = 0; m < 12; m++) {
      const yearSuffix = String(YEARS[y]).slice(2);
      labels.push(`${MONTHS_FR[m]} ${yearSuffix}`);
    }
  }
  return labels;
};
const MONTH_LABELS = generateMonthLabels();

const initialSettings = {
  startYear: 2026,
  yearCount: 3,
  year: 2026,
  eurUsd: 1.08,
  inflation: 0.025,
  salaryIncrease: 0.03,
  pass: 47700,
  smicAnnuel: 21600,
  maladie: 0.07,
  maladieComplement: 0.06,
  allocFamiliales: 0.0345,
  allocFamilialesFort: 0.0525,
  vieillessePlaf: 0.0855,
  vieillesseDepl: 0.0202,
  agircT1: 0.0601,
  agircT2: 0.0864,
  chomage: 0.0405,
  ags: 0.002,
  fnal: 0.005,
  csa: 0.003,
  dialogueSocial: 0.00016,
  apprentissage: 0.0068,
  formationPro: 0.01,
  transport: 0.0295,
  accidentTravail: 0.018,
  provisionCP: 0.10,
  effectifPlus50: false,
  zoneIDF: true,
  reductionFillon: true,
  joursOuvres: 228,
  coutM2: 350,
  surfaceParEmploye: 12,
  cirEnabled: true,
  cirRate: 0.30,
  cirPlafond: 100000000,
  cirDelayMonths: 12,
  delays: { subventions: 3, cro: 2, salaires: 0, chargesSociales: 1, overhead: 1, other: 0 },
  fundraising: { targetAmount: 15000000, targetDate: "2027-06", runway: 24 },
  alertThresholds: { minRunway: 12, minRunwayCritical: 6, maxBurnRate: 500000, maxVariance: 0.10 },
};

const initialEntities = [
  { id: 1, name: "BioTech Main SAS", type: "Société mère", siren: "123 456 789 00012", currency: "EUR", date: "2020-03-15", participation: 100, color: "#2E5090" },
  { id: 2, name: "JV Pharma GmbH", type: "Joint-Venture", siren: "DE123456789", currency: "EUR", date: "2023-09-01", participation: 55, color: "#27AE60" },
  { id: 3, name: "Partenariat Univ. Pasteur", type: "Partenariat", siren: "N/A", currency: "EUR", date: "2025-01-01", participation: 0, color: "#8E44AD" },
];

const initialEmployees = [
  { id: 1, name: "Dr. Martin Dupont", dept: "Direction", entityId: 1, contract: "CDI", startDate: "2020-03-15", salary: 120000, fte: 1.0, status: "Actif", endDate: "", comment: "CEO / Fondateur", ticketsResto: 1584, transportBenefit: 480, bonus: 15000, plannedStartDate: null },
  { id: 2, name: "Sophie Laurent", dept: "R&D", entityId: 1, contract: "CDI", startDate: "2021-06-01", salary: 65000, fte: 1.0, status: "Actif", endDate: "", comment: "Responsable labo", ticketsResto: 1584, transportBenefit: 480, bonus: 5000, plannedStartDate: null },
  { id: 3, name: "Pierre Moreau", dept: "R&D", entityId: 1, contract: "CDI", startDate: "2021-09-15", salary: 55000, fte: 1.0, status: "Actif", endDate: "", comment: "Chercheur senior", ticketsResto: 1584, transportBenefit: 480, bonus: 3000, plannedStartDate: null },
  { id: 4, name: "Amina Benali", dept: "R&D", entityId: 2, contract: "CDI", startDate: "2024-01-01", salary: 60000, fte: 1.0, status: "Actif", endDate: "", comment: "Chef de projet onco", ticketsResto: 1584, transportBenefit: 480, bonus: 4000, plannedStartDate: null },
  { id: 5, name: "Lucas Petit", dept: "Réglementaire", entityId: 1, contract: "CDI", startDate: "2022-03-01", salary: 58000, fte: 1.0, status: "Actif", endDate: "", comment: "Affaires réglementaires", ticketsResto: 1584, transportBenefit: 480, bonus: 3500, plannedStartDate: null },
  { id: 6, name: "Marie Dubois", dept: "Finance/Admin", entityId: 1, contract: "CDI", startDate: "2021-01-15", salary: 52000, fte: 1.0, status: "Actif", endDate: "", comment: "Comptabilité & admin", ticketsResto: 1584, transportBenefit: 480, bonus: 3000, plannedStartDate: null },
  { id: 7, name: "Jean Leroy", dept: "R&D", entityId: 3, contract: "CDD", startDate: "2025-09-01", salary: 42000, fte: 1.0, status: "Actif", endDate: "2027-08-31", comment: "Post-doc détaché", ticketsResto: 1584, transportBenefit: 480, bonus: 0, plannedStartDate: null },
  { id: 8, name: "CRO Project Manager", dept: "R&D", entityId: 2, contract: "Freelance", startDate: "2025-04-01", salary: 85000, fte: 0.8, status: "Actif", endDate: "2026-12-31", comment: "Consultant externe CRO", ticketsResto: 0, transportBenefit: 0, bonus: 0, plannedStartDate: null },
];

const initialFteAlloc = {
  1: { 1: 0.60, 2: 0.30, 3: 0.10 },
  2: { 1: 0.70, 2: 0.20, 3: 0.10 },
  3: { 1: 0.80, 2: 0.10, 3: 0.10 },
  4: { 1: 0.00, 2: 1.00, 3: 0.00 },
  5: { 1: 0.60, 2: 0.30, 3: 0.10 },
  6: { 1: 0.70, 2: 0.20, 3: 0.10 },
  7: { 1: 0.00, 2: 0.00, 3: 1.00 },
  8: { 1: 0.00, 2: 1.00, 3: 0.00 },
};

const expandArray = (arr, newLen) => {
  const result = [...arr];
  while (result.length < newLen) result.push(result[result.length - 1] || 0);
  return result;
};

const initialRevenue = {
  "Subventions & Aides (BPI, ANR, EU)": expandArray([50000,50000,50000,50000,50000,50000,50000,50000,50000,50000,50000,50000], TOTAL_MONTHS),
  "Licences & Royalties": expandArray([0,0,0,0,0,0,0,0,0,0,0,0], TOTAL_MONTHS),
  "Revenus JV Pharma": expandArray([0,0,0,15000,15000,15000,15000,15000,15000,15000,15000,15000], TOTAL_MONTHS),
  "Revenus Partenariat Recherche": expandArray([0,0,0,0,0,10000,10000,10000,10000,10000,10000,10000], TOTAL_MONTHS),
  "Autres revenus": expandArray([0,0,0,0,0,0,0,0,0,0,0,0], TOTAL_MONTHS),
};

const initialOverhead = {
  "Loyer & Charges locaux": expandArray([12000,12000,12000,12000,12000,12000,12000,12000,12000,12000,12000,12000], TOTAL_MONTHS),
  "IT, Logiciels & Licences": expandArray([4000,4000,4000,4000,4000,4000,4000,4000,4000,4000,4000,4000], TOTAL_MONTHS),
  "Déplacements & Congrès (hors R&D)": expandArray([2000,1000,5000,2000,1000,3000,1000,1000,5000,2000,1000,3000], TOTAL_MONTHS),
  "Honoraires (juridique, audit)": expandArray([3000,3000,3000,3000,3000,3000,3000,3000,3000,3000,3000,3000], TOTAL_MONTHS),
  "Assurances": expandArray([2500,2500,2500,2500,2500,2500,2500,2500,2500,2500,2500,2500], TOTAL_MONTHS),
  "Autres frais généraux": expandArray([1500,1500,1500,1500,1500,1500,1500,1500,1500,1500,1500,1500], TOTAL_MONTHS),
};

const initialProjects = [
  { id: 1, name: "Prog. Oncologie Phase I", entityId: 2, cro: 320000, reagents: 45000, equipment: 30000, ip: 15000, travel: 12000, other: 8000, growthRate: 0.05 },
  { id: 2, name: "Prog. Immunothérapie Préclin.", entityId: 1, cro: 95000, reagents: 60000, equipment: 25000, ip: 20000, travel: 8000, other: 5000, growthRate: 0.03 },
  { id: 3, name: "Plateforme Biomarqueurs", entityId: 1, cro: 40000, reagents: 35000, equipment: 50000, ip: 10000, travel: 5000, other: 3000, growthRate: 0.02 },
  { id: 4, name: "Collab. Pasteur — Mécanismes", entityId: 3, cro: 0, reagents: 20000, equipment: 5000, ip: 0, travel: 3000, other: 2000, growthRate: 0 },
  { id: 5, name: "Discovery — Nouvelle Cible", entityId: 1, cro: 25000, reagents: 30000, equipment: 10000, ip: 5000, travel: 4000, other: 2000, growthRate: 0.04 },
];

const initialRaises = {
  1: { pct: 0.02, effectiveMonth: 0, comment: "Performance exceptionnelle" },
  2: { pct: 0.04, effectiveMonth: 3, comment: "Promotion responsable" },
  3: { pct: 0.025, effectiveMonth: 6, comment: "" },
  4: { pct: 0.03, effectiveMonth: 0, comment: "Alignement marché" },
  5: { pct: 0.02, effectiveMonth: 6, comment: "" },
  6: { pct: 0.015, effectiveMonth: 0, comment: "" },
  7: { pct: 0, effectiveMonth: 0, comment: "CDD — pas d'augmentation" },
  8: { pct: 0, effectiveMonth: 0, comment: "Freelance — tarif fixe" },
};

const overheadKeys = {
  "Loyer & charges locaux": { 1: 0.50, 2: 0.30, 3: 0.20 },
  "IT & Licences": { 1: 0.40, 2: 0.35, 3: 0.25 },
  "Assurances": { 1: 0.50, 2: 0.30, 3: 0.20 },
  "Services généraux": { 1: 0.45, 2: 0.30, 3: 0.25 },
  "Direction & Admin": { 1: 0.60, 2: 0.25, 3: 0.15 },
};

const initialScenarios = [
  { id: "base", name: "Scénario de base", color: "#2E5090", revenueMultiplier: 1.0, costMultiplier: 1.0, headcountAdj: 0, delayMonths: 0, notes: "" },
];

const initialActuals = { revenue: {}, expenses: {} };

const initialMilestones = [
  { id: 1, name: "IND filée", date: "2026-06-30", type: "regulatory", entityId: 1 },
  { id: 2, name: "Levée de fonds Série A", date: "2027-03-01", type: "fundraising", entityId: 1 },
];

const initialNotes = { dashboard: "", budget: "", hr: "", rd: "", entities: "", scenarios: "", settings: "" };

const calculateChargesFR = (salaireBrut, contract, s) => {
  if (contract === "Freelance") return { total: 0, taux: 0, detail: { "Pas de charges (Freelance)": 0 }, totalCharged: salaireBrut };
  const pass = s.pass, smic = s.smicAnnuel, detail = {};
  let total = 0;
  const mal = salaireBrut * s.maladie;
  const malCompl = salaireBrut > 2.5 * smic ? salaireBrut * s.maladieComplement : 0;
  detail["Assurance maladie (7%)"] = mal;
  if (malCompl > 0) detail["Complément maladie (6%)"] = malCompl;
  total += mal + malCompl;
  const afTaux = salaireBrut > 3.5 * smic ? s.allocFamilialesFort : s.allocFamiliales;
  detail[`Alloc. familiales (${(afTaux*100).toFixed(2)}%)`] = salaireBrut * afTaux;
  total += salaireBrut * afTaux;
  const baseVP = Math.min(salaireBrut, pass);
  detail["Vieillesse plafonnée (8.55%)"] = baseVP * s.vieillessePlaf;
  total += baseVP * s.vieillessePlaf;
  detail["Vieillesse déplafonnée (2.02%)"] = salaireBrut * s.vieillesseDepl;
  total += salaireBrut * s.vieillesseDepl;
  detail["AGIRC-ARRCO T1 (6.01%)"] = baseVP * s.agircT1;
  total += baseVP * s.agircT1;
  const baseT2 = Math.max(0, Math.min(salaireBrut, 8 * pass) - pass);
  if (baseT2 > 0) { detail["AGIRC-ARRCO T2 (8.64%)"] = baseT2 * s.agircT2; total += baseT2 * s.agircT2; }
  const baseChom = Math.min(salaireBrut, 4 * pass);
  detail["Chômage (4.05%)"] = baseChom * s.chomage; total += baseChom * s.chomage;
  detail["AGS (0.20%)"] = baseChom * s.ags; total += baseChom * s.ags;
  const fnal = s.effectifPlus50 ? salaireBrut * s.fnal : baseVP * 0.001;
  detail[s.effectifPlus50 ? "FNAL (0.50%)" : "FNAL (0.10% plaf.)"] = fnal; total += fnal;
  detail["CSA (0.30%)"] = salaireBrut * s.csa; total += salaireBrut * s.csa;
  detail["Dialogue social"] = salaireBrut * s.dialogueSocial; total += salaireBrut * s.dialogueSocial;
  detail["Taxe apprentissage (0.68%)"] = salaireBrut * s.apprentissage; total += salaireBrut * s.apprentissage;
  detail["Formation pro. (1.00%)"] = salaireBrut * s.formationPro; total += salaireBrut * s.formationPro;
  if (s.zoneIDF) { detail[`Transport IDF (${(s.transport*100).toFixed(2)}%)`] = salaireBrut * s.transport; total += salaireBrut * s.transport; }
  detail[`Accident travail (${(s.accidentTravail*100).toFixed(1)}%)`] = salaireBrut * s.accidentTravail; total += salaireBrut * s.accidentTravail;
  if (s.reductionFillon && salaireBrut <= 1.6 * smic && salaireBrut > 0) {
    const T = 0.3194, coeff = Math.min(Math.max((T / 0.6) * ((1.6 * smic / salaireBrut) - 1), 0), T);
    const fillon = -salaireBrut * coeff;
    if (fillon < 0) { detail["Réduction Fillon"] = fillon; total += fillon; }
  }
  detail["Provision congés payés (10%)"] = salaireBrut * s.provisionCP; total += salaireBrut * s.provisionCP;
  return { total, taux: salaireBrut > 0 ? total / salaireBrut : 0, detail, totalCharged: salaireBrut + total };
};

const fmt = (n, currency = "EUR") => {
  if (n === null || n === undefined || isNaN(n)) return "—";
  const abs = Math.abs(n);
  const s = n < 0 ? "(" : "", se = n < 0 ? ")" : "";
  return currency === "EUR" ? `${s}${abs.toLocaleString("fr-FR")} €${se}` : `${s}$${abs.toLocaleString("en-US")}${se}`;
};
const fmtPct = (n) => n != null ? `${(n * 100).toFixed(1)}%` : "—";
const fmtNum = (n) => n != null ? n.toLocaleString("fr-FR") : "—";
let _nextId = 100;
const nextId = () => ++_nextId;

const dateToMonthIndex = (dateStr) => {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  const refDate = new Date("2026-01-01");
  const monthDiff = (d.getFullYear() - refDate.getFullYear()) * 12 + (d.getMonth() - refDate.getMonth());
  return Math.max(0, monthDiff);
};

const KPICard = ({ icon: Icon, label, value, subtitle, color = "#2E5090", warning = false }) => (
  <div className={`bg-white rounded-xl shadow-sm border p-5 ${warning ? "border-red-300 bg-red-50" : "border-gray-100"}`}>
    <div className="flex items-center gap-3 mb-2">
      <div className="p-2 rounded-lg" style={{ backgroundColor: color + "18" }}><Icon size={20} style={{ color }} /></div>
      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</span>
    </div>
    <div className="text-2xl font-bold text-gray-900">{value}</div>
    {subtitle && <div className="text-xs text-gray-400 mt-1">{subtitle}</div>}
  </div>
);

const TabBtn = ({ active, onClick, icon: Icon, label }) => (
  <button onClick={onClick} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${active ? "bg-blue-600 text-white shadow-md" : "text-gray-600 hover:bg-gray-100"}`}>
    <Icon size={16} />{label}
  </button>
);

const Badge = ({ text, color }) => {
  const c = { green: "bg-green-100 text-green-700", orange: "bg-orange-100 text-orange-700", red: "bg-red-100 text-red-700", blue: "bg-blue-100 text-blue-700", purple: "bg-purple-100 text-purple-700", gray: "bg-gray-100 text-gray-600" };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c[color] || c.gray}`}>{text}</span>;
};

const Btn = ({ onClick, children, variant = "primary", className = "" }) => {
  const v = { primary: "bg-blue-600 text-white hover:bg-blue-700", danger: "bg-red-50 text-red-600 hover:bg-red-100", ghost: "bg-gray-100 text-gray-600 hover:bg-gray-200", success: "bg-green-600 text-white hover:bg-green-700" };
  return <button onClick={onClick} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${v[variant]} ${className}`}>{children}</button>;
};

const Input = ({ value, onChange, type = "text", className = "", ...props }) => (
  <input type={type} value={value}
    onChange={e => {
      if (type === "number") { const raw = e.target.value; onChange(raw === "" ? "" : (parseFloat(raw) || 0)); }
      else onChange(e.target.value);
    }}
    onBlur={e => { if (type === "number" && e.target.value === "") onChange(0); }}
    className={`border rounded-lg p-1.5 text-sm text-blue-700 font-medium ${className}`} {...props} />
);

const Select = ({ value, onChange, options, className = "" }) => (
  <select value={value} onChange={e => onChange(e.target.value)} className={`border rounded-lg p-1.5 text-sm text-blue-700 font-medium bg-white ${className}`}>
    {options.map(o => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
  </select>
);

const SaveStatus = ({ status, lastSaved }) => {
  const icons = {
    loading: <Loader2 size={14} className="animate-spin text-blue-500" />,
    saving: <Loader2 size={14} className="animate-spin text-orange-500" />,
    saved: <Cloud size={14} className="text-green-500" />,
    error: <CloudOff size={14} className="text-red-500" />,
    local: <CloudOff size={14} className="text-gray-400" />,
  };
  const labels = {
    loading: "Chargement…",
    saving: "Sauvegarde…",
    saved: lastSaved ? `Sauvegardé ${lastSaved.toLocaleTimeString("fr-FR")}` : "Sauvegardé",
    error: "Erreur de connexion",
    local: "Mode local (pas de base de données)",
  };
  return (
    <div className="flex items-center gap-1.5 text-xs text-gray-500">
      {icons[status]}<span>{labels[status]}</span>
    </div>
  );
};

export default function BioTechDashboard() {
  const [tab, setTab] = useState("dashboard");
  const [showCurrency, setShowCurrency] = useState("EUR");
  // activeScenarioId is read from shared state below
  const [selectedYear, setSelectedYear] = useState(0);
  const [budgetView, setBudgetView] = useState("budget");
  const [showAlerts, setShowAlerts] = useState(true);

  const { state: shared, updateField, status: saveStatus, lastSaved } = useSharedState({
    settings: initialSettings,
    entities: initialEntities,
    employees: initialEmployees,
    fteAlloc: initialFteAlloc,
    revenue: initialRevenue,
    overhead: initialOverhead,
    projects: initialProjects,
    cashBalance: 1500000,
    overheadAlloc: overheadKeys,
    raises: initialRaises,
    scenarios: initialScenarios,
    activeScenarioId: "base",
    actuals: initialActuals,
    milestones: initialMilestones,
    notes: initialNotes,
  });

  const settings = shared.settings;
  const entities = shared.entities;
  const employees = shared.employees;
  const fteAlloc = shared.fteAlloc;
  const revenue = shared.revenue;
  const overhead = shared.overhead;
  const projects = shared.projects;
  const cashBalance = shared.cashBalance;
  const overheadAlloc = shared.overheadAlloc;
  const raises = shared.raises;
  const scenarios = shared.scenarios || initialScenarios;
  const activeScenarioId = shared.activeScenarioId || "base";
  const actuals = shared.actuals || initialActuals;
  const milestones = shared.milestones || initialMilestones;
  const notes = shared.notes || initialNotes;

  const setSettings = (v) => updateField("settings", v);
  const setEntities = (v) => updateField("entities", v);
  const setEmployees = (v) => updateField("employees", v);
  const setFteAlloc = (v) => updateField("fteAlloc", v);
  const setRevenue = (v) => updateField("revenue", v);
  const setOverhead = (v) => updateField("overhead", v);
  const setProjects = (v) => updateField("projects", v);
  const setCashBalance = (v) => updateField("cashBalance", v);
  const setOverheadAlloc = (v) => updateField("overheadAlloc", v);
  const setRaises = (v) => updateField("raises", v);
  const setScenarios = (v) => updateField("scenarios", v);
  const setActiveScenarioId = (id) => { updateField("activeScenarioId", id); };
  const setActuals = (v) => updateField("actuals", v);
  const setMilestones = (v) => updateField("milestones", v);
  const setNotes = (v) => updateField("notes", v);

  const activeScenario = scenarios.find(s => s.id === activeScenarioId) || scenarios[0];

  const computed = useMemo(() => {
    const empCosts = employees.map(e => {
      const raise = raises[e.id] || { pct: 0, effectiveMonth: 0 };
      const globalPct = settings.salaryIncrease || 0;
      const individualPct = raise.pct || 0;
      const totalRaisePct = globalPct + individualPct;
      const effMonth = raise.effectiveMonth || 0;
      const salaryAfter = e.salary * (1 + totalRaisePct);

      const monthlyBefore = e.salary / 12;
      const monthlyAfter = salaryAfter / 12;
      const monthlyBreakdown36 = Array(TOTAL_MONTHS).fill(0).map((_, mi) => {
        const yearIdx = Math.floor(mi / 12);
        const monthInYear = mi % 12;
        const yearlyMultiplier = Math.pow(1 + settings.salaryIncrease, yearIdx);
        const baseSalary = e.salary * yearlyMultiplier;
        const afterIncrease = baseSalary * (1 + individualPct);
        const monthlyVal = monthInYear >= effMonth ? afterIncrease / 12 : baseSalary / 12;

        const planStartMonth = dateToMonthIndex(e.plannedStartDate);
        if (e.status === "Planifié" && (planStartMonth === null || mi < planStartMonth)) return 0;
        return monthlyVal;
      });

      const annualEffective = monthlyBreakdown36.reduce((s, m) => s + m, 0) / TOTAL_MONTHS * 12;
      const charges = calculateChargesFR(annualEffective, e.contract, settings);
      const benefits = (e.ticketsResto || 0) + (e.transportBenefit || 0) + (e.bonus || 0);
      const benefitsMonthly = benefits / 12;

      return {
        ...e,
        charges,
        charged: charges.totalCharged + benefits,
        tauxCharges: charges.taux,
        benefits,
        salaryAfter,
        annualEffective,
        totalRaisePct,
        raise,
        monthlyBreakdown36,
        monthlyCostBreakdown36: monthlyBreakdown36.map(m => {
          const annualized = m * 12;
          const ch = calculateChargesFR(annualized, e.contract, settings);
          return m + (ch.total / 12) + benefitsMonthly;
        })
      };
    });

    const monthlySalary36 = Array(TOTAL_MONTHS).fill(0).map((_, mi) => empCosts.reduce((s, e) => s + (e.monthlyCostBreakdown36[mi] || 0), 0));
    const totalMasse = empCosts.reduce((s, e) => s + e.charged, 0);

    const rdCostKeys = ["cro","reagents","equipment","ip","travel","other"];
    const rdCostLabels = {"cro":"CRO & Sous-traitance","reagents":"Réactifs & Consommables","equipment":"Équipements & Amortissements","ip":"PI / Brevets","travel":"Déplacements R&D","other":"Autres coûts R&D"};

    const rdMonthly36 = {};
    rdCostKeys.forEach(k => {
      const costsByYear = [0, 0, 0];
      projects.forEach(p => {
        const baseVal = p[k] || 0;
        costsByYear[0] += baseVal;
        costsByYear[1] += baseVal * (1 + (p.growthRate || 0));
        costsByYear[2] += baseVal * Math.pow(1 + (p.growthRate || 0), 2);
      });
      const arr36 = [];
      for (let y = 0; y < 3; y++) {
        for (let m = 0; m < 12; m++) {
          arr36.push(Math.round(costsByYear[y] / 12));
        }
      }
      rdMonthly36[k] = arr36;
    });

    const rdPerMonth36 = Array(TOTAL_MONTHS).fill(0).map((_, mi) => rdCostKeys.reduce((s, k) => s + rdMonthly36[k][mi], 0));

    const overheadPerMonth36 = Array(TOTAL_MONTHS).fill(0).map((_, mi) => Object.values(overhead).reduce((s, arr) => s + (arr[mi] || 0), 0));

    const revPerMonth36Raw = Array(TOTAL_MONTHS).fill(0).map((_, mi) => Object.values(revenue).reduce((s, arr) => s + (arr[mi] || 0), 0));

    const cirEligibleCosts36 = Array(TOTAL_MONTHS).fill(0).map((_, mi) => {
      const rdPayroll = empCosts.filter(e => e.dept === "R&D").reduce((s, e) => s + (e.monthlyCostBreakdown36[mi] || 0), 0);
      const directRDCosts = rdCostKeys.reduce((s, k) => s + rdMonthly36[k][mi], 0);
      return rdPayroll + directRDCosts;
    });

    const cirReceived36 = Array(TOTAL_MONTHS).fill(0);
    const cirAmount = cirEligibleCosts36.reduce((s, m) => s + m, 0) * (settings.cirRate || 0);
    const cirCapped = Math.min(cirAmount, settings.cirPlafond || 100000000);
    if (settings.cirEnabled) {
      const cirDelayMonths = (settings.cirDelayMonths || 12);
      for (let mi = cirDelayMonths; mi < TOTAL_MONTHS; mi++) {
        cirReceived36[mi] = Math.round(cirCapped / 12);
      }
    }

    const revPerMonth36Adjusted = Array(TOTAL_MONTHS).fill(0).map((_, mi) => {
      const base = revPerMonth36Raw[mi];
      const scenario = activeScenario;
      return Math.round(base * (scenario.revenueMultiplier || 1.0));
    });

    const revPerMonth36WithDelay = Array(TOTAL_MONTHS).fill(0);
    Object.entries(revenue).forEach(([lineKey, arr]) => {
      const isSubvention = lineKey.includes("Subvention");
      const isCRO = lineKey.includes("CRO");
      const delay = isSubvention ? (settings.delays?.subventions || 3) : isCRO ? (settings.delays?.cro || 2) : 0;
      arr.forEach((val, mi) => {
        const delayedIdx = mi + delay;
        if (delayedIdx < TOTAL_MONTHS) {
          revPerMonth36WithDelay[delayedIdx] = (revPerMonth36WithDelay[delayedIdx] || 0) + val;
        }
      });
    });

    const expPerMonth36 = Array(TOTAL_MONTHS).fill(0).map((_, mi) => {
      const salary = monthlySalary36[mi];
      const rd = rdPerMonth36[mi];
      const overhead = overheadPerMonth36[mi];
      const scenario = activeScenario;
      const costMultiplier = scenario.costMultiplier || 1.0;
      return Math.round((salary + rd + overhead) * costMultiplier);
    });

    const expWithDelay36 = Array(TOTAL_MONTHS).fill(0);
    const delays = settings.delays || {};
    monthlySalary36.forEach((val, mi) => {
      const delayedIdx = mi + (delays.salaires || 0);
      if (delayedIdx < TOTAL_MONTHS) expWithDelay36[delayedIdx] = (expWithDelay36[delayedIdx] || 0) + val;
    });
    rdPerMonth36.forEach((val, mi) => {
      const delayedIdx = mi + (delays.cro || 2);
      if (delayedIdx < TOTAL_MONTHS) expWithDelay36[delayedIdx] = (expWithDelay36[delayedIdx] || 0) + val;
    });
    overheadPerMonth36.forEach((val, mi) => {
      const delayedIdx = mi + (delays.overhead || 1);
      if (delayedIdx < TOTAL_MONTHS) expWithDelay36[delayedIdx] = (expWithDelay36[delayedIdx] || 0) + val;
    });

    const netPerMonth36 = Array(TOTAL_MONTHS).fill(0).map((_, mi) => revPerMonth36Adjusted[mi] + cirReceived36[mi] - expPerMonth36[mi]);
    const cashFlow36 = [];
    let bal = cashBalance;
    for (let mi = 0; mi < TOTAL_MONTHS; mi++) {
      bal += netPerMonth36[mi];
      cashFlow36.push({ month: MONTH_LABELS[mi], year: YEARS[Math.floor(mi / 12)], revenus: revPerMonth36Adjusted[mi], cir: cirReceived36[mi], depenses: expPerMonth36[mi], net: netPerMonth36[mi], solde: bal, mi });
    }

    const totalRevenue = revPerMonth36Adjusted.reduce((a, b) => a + b, 0);
    const totalExpenses = expPerMonth36.reduce((a, b) => a + b, 0);
    const currentCash = bal;
    const avgBurn = totalExpenses / TOTAL_MONTHS;
    const runway = avgBurn > 0 ? currentCash / avgBurn : Infinity;

    const allocCosts = {}; entities.forEach(e => { allocCosts[e.id] = 0; });
    Object.entries(fteAlloc).forEach(([empIdStr, alloc]) => {
      const emp = empCosts.find(e => e.id === parseInt(empIdStr));
      if (!emp) return;
      Object.entries(alloc).forEach(([eid, pct]) => { allocCosts[parseInt(eid)] = (allocCosts[parseInt(eid)] || 0) + emp.charged * pct; });
    });

    const projCosts = {}; entities.forEach(e => { projCosts[e.id] = 0; });
    projects.forEach(p => {
      const t = rdCostKeys.reduce((s, k) => s + (p[k] || 0), 0);
      projCosts[p.entityId] = (projCosts[p.entityId] || 0) + t;
    });

    const activeHC = empCosts.filter(e => e.status === "Actif").reduce((s, e) => s + e.fte, 0);
    const plannedHC = empCosts.filter(e => e.status === "Planifié").reduce((s, e) => s + e.fte, 0);
    const deptBreakdown = {}; empCosts.forEach(e => { deptBreakdown[e.dept] = (deptBreakdown[e.dept] || 0) + e.charged; });

    const alerts = [];
    if (runway < settings.alertThresholds.minRunwayCritical) alerts.push({ level: "critical", text: `Runway critique: ${runway.toFixed(1)} mois` });
    else if (runway < settings.alertThresholds.minRunway) alerts.push({ level: "warning", text: `Runway faible: ${runway.toFixed(1)} mois` });
    if (avgBurn > settings.alertThresholds.maxBurnRate) alerts.push({ level: "warning", text: `Burn rate élevé: ${fmt(avgBurn)}` });

    return {
      empCosts,
      monthlySalary36,
      totalMasse,
      rdCostKeys,
      rdCostLabels,
      rdMonthly36,
      rdPerMonth36,
      overheadPerMonth36,
      revPerMonth36Adjusted,
      cirReceived36,
      cirCapped,
      expPerMonth36,
      netPerMonth36,
      cashFlow36,
      totalRevenue,
      totalExpenses,
      currentCash,
      avgBurn,
      runway,
      allocCosts,
      projCosts,
      activeHC,
      plannedHC,
      deptBreakdown,
      alerts,
      monthlySalary36Original: monthlySalary36,
      cirEligibleCosts36,
    };
  }, [settings, entities, employees, fteAlloc, revenue, overhead, projects, cashBalance, raises, activeScenario]);

  const cv = (val) => showCurrency === "USD" ? val * settings.eurUsd : val;
  const cur = showCurrency;

  const DashboardTab = () => {
    const entityPieData = entities.map(e => ({ name: e.name.length > 20 ? e.name.substring(0, 18) + "…" : e.name, value: (computed.allocCosts[e.id] || 0) + (computed.projCosts[e.id] || 0), color: e.color })).filter(d => d.value > 0);
    const deptPieData = Object.entries(computed.deptBreakdown).map(([dept, val], i) => ({ name: dept, value: val, color: COLORS[i % COLORS.length] }));
    const runwayColor = computed.runway < 6 ? "#E74C3C" : computed.runway < 12 ? "#F39C12" : "#27AE60";

    const scenarioComparisonData = scenarios.map(sc => {
      let tempBal = cashBalance;
      for (let mi = 0; mi < TOTAL_MONTHS; mi++) {
        const rev = Object.values(revenue).reduce((s, arr) => s + (arr[mi] || 0), 0) * (sc.revenueMultiplier || 1.0);
        const exp = computed.expPerMonth36[mi] * (sc.costMultiplier || 1.0);
        tempBal += rev - exp;
      }
      return { name: sc.name, runway: tempBal > 0 ? tempBal / (computed.avgBurn * (sc.costMultiplier || 1.0)) : 0, color: sc.color };
    });

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard icon={Wallet} label="Trésorerie" value={fmt(cv(computed.currentCash), cur)} subtitle={`Solde initial: ${fmt(cv(cashBalance), cur)}`} color="#2E5090" />
          <KPICard icon={TrendingDown} label="Burn rate / mois" value={fmt(cv(computed.avgBurn), cur)} subtitle={`Dépenses 3 ans: ${fmt(cv(computed.totalExpenses), cur)}`} color="#E74C3C" />
          <KPICard icon={Calendar} label="Runway" value={`${computed.runway.toFixed(1)} mois`} color={runwayColor} warning={computed.runway < 12} subtitle={computed.runway < 12 ? "Attention — moins de 12 mois" : "Situation confortable"} />
          <KPICard icon={Users} label="Effectif (ETP)" value={computed.activeHC.toFixed(1)} subtitle={`+ ${computed.plannedHC.toFixed(1)} planifiés`} color="#27AE60" />
        </div>

        {showAlerts && computed.alerts.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <h3 className="font-semibold text-red-700 mb-2 flex items-center gap-2"><AlertTriangle size={16} /> Alertes</h3>
            {computed.alerts.map((a, i) => (
              <div key={i} className={`text-sm py-1 ${a.level === "critical" ? "text-red-700" : "text-orange-700"}`}>{a.text}</div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-sm font-bold text-gray-700 mb-4">Trésorerie 3 ans</h3>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={computed.cashFlow36}>
                <defs><linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2E5090" stopOpacity={0.15} /><stop offset="95%" stopColor="#2E5090" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" /><XAxis dataKey="month" tick={{ fontSize: 10 }} interval={5} /><YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={v => fmt(cv(v), cur)} /><Area type="monotone" dataKey="solde" stroke="#2E5090" fill="url(#cg)" strokeWidth={2.5} name="Solde" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-sm font-bold text-gray-700 mb-4">Revenus vs Dépenses</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={computed.cashFlow36.filter((_, i) => i % 3 === 0)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" /><XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} /><Tooltip formatter={v => fmt(cv(v), cur)} /><Legend />
                <Bar dataKey="revenus" fill="#27AE60" name="Revenus" radius={[4,4,0,0]} /><Bar dataKey="depenses" fill="#E74C3C" name="Dépenses" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-sm font-bold text-gray-700 mb-4">Coûts par entité</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart><Pie data={entityPieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}>{entityPieData.map((d, i) => <Cell key={i} fill={d.color} />)}</Pie><Tooltip formatter={v => fmt(cv(v), cur)} /></PieChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-sm font-bold text-gray-700 mb-4">Masse salariale par département</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart><Pie data={deptPieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}>{deptPieData.map((d, i) => <Cell key={i} fill={d.color} />)}</Pie><Tooltip formatter={v => fmt(cv(v), cur)} /></PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-bold text-gray-700 mb-4">Comparaison des scénarios (Runway)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={scenarioComparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="runway" fill="#2E5090" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-bold text-gray-700 mb-4">Jalons (Milestones)</h3>
          <div className="space-y-3">
            {milestones.length === 0 ? <p className="text-gray-400 text-sm">Aucun jalon défini</p> : milestones.map(m => {
              const typeColors = { regulatory: "blue", clinical: "purple", business: "green", fundraising: "orange" };
              return (
                <div key={m.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-2 h-2 rounded-full bg-${typeColors[m.type] || "blue"}-500`} />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{m.name}</div>
                    <div className="text-xs text-gray-500">{m.date}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-bold text-gray-700 mb-4">Consolidation par entité</h3>
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50"><th className="text-left p-3 font-semibold text-gray-600">Entité</th><th className="text-right p-3 font-semibold text-gray-600">Personnel</th><th className="text-right p-3 font-semibold text-gray-600">R&D</th><th className="text-right p-3 font-semibold text-gray-600">Total</th></tr></thead>
            <tbody>{entities.map(e => { const p = computed.allocCosts[e.id]||0, r = computed.projCosts[e.id]||0; return (
              <tr key={e.id} className="border-t border-gray-100 hover:bg-gray-50"><td className="p-3"><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{backgroundColor:e.color}}/><span className="font-medium">{e.name}</span></div></td><td className="p-3 text-right">{fmt(cv(p),cur)}</td><td className="p-3 text-right">{fmt(cv(r),cur)}</td><td className="p-3 text-right font-bold">{fmt(cv(p+r),cur)}</td></tr>
            );})}</tbody>
          </table>
        </div>
      </div>
    );
  };

  const BudgetTab = () => {
    const [editCell, setEditCell] = useState(null);
    const [editVal, setEditVal] = useState("");
    const [newRevLine, setNewRevLine] = useState("");
    const [newOhLine, setNewOhLine] = useState("");
    const [editCash, setEditCash] = useState(false);
    const [cashVal, setCashVal] = useState(String(cashBalance));

    const yearStart = selectedYear * 12;
    const yearEnd = yearStart + 12;
    const currentYear = YEARS[selectedYear];

    const startEdit = (section, key, mi) => {
      setEditCell({ section, key, mi });
      setEditVal(String((section === "rev" ? revenue : overhead)[key][mi]));
    };

    const saveEdit = () => {
      if (!editCell) return;
      const v = parseFloat(editVal) || 0;
      const { section, key, mi } = editCell;
      if (section === "rev") setRevenue(p => ({...p, [key]: p[key].map((x, i) => i === mi ? v : x)}));
      else setOverhead(p => ({...p, [key]: p[key].map((x, i) => i === mi ? v : x)}));
      setEditCell(null);
    };

    const addRevLine = () => { if (!newRevLine.trim()) return; setRevenue(p => ({...p, [newRevLine.trim()]: Array(TOTAL_MONTHS).fill(0)})); setNewRevLine(""); };
    const addOhLine = () => { if (!newOhLine.trim()) return; setOverhead(p => ({...p, [newOhLine.trim()]: Array(TOTAL_MONTHS).fill(0)})); setNewOhLine(""); };

    const saveYearlyCell = (section, key, yearIdx, v) => {
      const val = parseFloat(v) || 0;
      if (section === "rev") {
        setRevenue(prev => ({
          ...prev,
          [key]: prev[key].map((x, mi) => Math.floor(mi / 12) === yearIdx ? val : x)
        }));
      } else {
        setOverhead(prev => ({
          ...prev,
          [key]: prev[key].map((x, mi) => Math.floor(mi / 12) === yearIdx ? val : x)
        }));
      }
    };

    const yearBudgetRevenue = Object.entries(revenue).map(([k, arr]) => ({
      key: k,
      y0: arr.slice(0, 12).reduce((a, b) => a + b, 0),
      y1: arr.slice(12, 24).reduce((a, b) => a + b, 0),
      y2: arr.slice(24, 36).reduce((a, b) => a + b, 0),
    }));

    const yearBudgetOverhead = Object.entries(overhead).map(([k, arr]) => ({
      key: k,
      y0: arr.slice(0, 12).reduce((a, b) => a + b, 0),
      y1: arr.slice(12, 24).reduce((a, b) => a + b, 0),
      y2: arr.slice(24, 36).reduce((a, b) => a + b, 0),
    }));

    const yearBudgetSalary = [
      computed.monthlySalary36.slice(0, 12).reduce((a, b) => a + b, 0),
      computed.monthlySalary36.slice(12, 24).reduce((a, b) => a + b, 0),
      computed.monthlySalary36.slice(24, 36).reduce((a, b) => a + b, 0),
    ];

    const yearBudgetRD = [
      computed.rdPerMonth36.slice(0, 12).reduce((a, b) => a + b, 0),
      computed.rdPerMonth36.slice(12, 24).reduce((a, b) => a + b, 0),
      computed.rdPerMonth36.slice(24, 36).reduce((a, b) => a + b, 0),
    ];

    return (
      <div className="space-y-6">
        <div className="flex gap-2 mb-4">
          {["Tous", "2026", "2027", "2028"].map((y, i) => (
            <Btn key={i} onClick={() => setSelectedYear(i === 0 ? 0 : i - 1)} variant={selectedYear === (i === 0 ? 0 : i - 1) ? "primary" : "ghost"}>{y}</Btn>
          ))}
          <div className="flex-1" />
          <div className="flex gap-2">
            <Btn onClick={() => setBudgetView("budget")} variant={budgetView === "budget" ? "primary" : "ghost"}>Budget</Btn>
            <Btn onClick={() => setBudgetView("actual")} variant={budgetView === "actual" ? "primary" : "ghost"}>Réalisé</Btn>
            <Btn onClick={() => setBudgetView("variance")} variant={budgetView === "variance" ? "primary" : "ghost"}>Écarts</Btn>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-bold text-gray-700 mb-4">Budget 3 ans</h3>
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50"><th className="text-left p-3 font-semibold text-gray-600">Ligne</th><th className="text-right p-3 font-semibold text-gray-600">2026</th><th className="text-right p-3 font-semibold text-gray-600">2027</th><th className="text-right p-3 font-semibold text-gray-600">2028</th></tr></thead>
            <tbody>
              <tr className="bg-blue-50"><td className="p-3 font-bold">REVENUS</td><td /><td /><td /></tr>
              {yearBudgetRevenue.map((r, i) => (
                <tr key={i} className="border-t border-gray-100"><td className="p-3">{r.key}</td><td className="p-3 text-right">{fmt(cv(r.y0), cur)}</td><td className="p-3 text-right">{fmt(cv(r.y1), cur)}</td><td className="p-3 text-right">{fmt(cv(r.y2), cur)}</td></tr>
              ))}
              <tr className="bg-gray-100 font-bold"><td className="p-3">Total Revenus</td><td className="p-3 text-right">{fmt(cv(yearBudgetRevenue.reduce((s, r) => s + r.y0, 0)), cur)}</td><td className="p-3 text-right">{fmt(cv(yearBudgetRevenue.reduce((s, r) => s + r.y1, 0)), cur)}</td><td className="p-3 text-right">{fmt(cv(yearBudgetRevenue.reduce((s, r) => s + r.y2, 0)), cur)}</td></tr>
              {settings.cirEnabled && <tr className="bg-purple-50"><td className="p-3 font-semibold">CIR / CII</td><td className="p-3 text-right">{fmt(cv(computed.cirCapped / 3), cur)}</td><td className="p-3 text-right">{fmt(cv(computed.cirCapped / 3), cur)}</td><td className="p-3 text-right">{fmt(cv(computed.cirCapped / 3), cur)}</td></tr>}
              <tr className="bg-red-50"><td className="p-3 font-bold">CHARGES</td><td /><td /><td /></tr>
              <tr className="border-t border-gray-100"><td className="p-3">Masse salariale</td><td className="p-3 text-right">{fmt(cv(yearBudgetSalary[0]), cur)}</td><td className="p-3 text-right">{fmt(cv(yearBudgetSalary[1]), cur)}</td><td className="p-3 text-right">{fmt(cv(yearBudgetSalary[2]), cur)}</td></tr>
              <tr className="border-t border-gray-100"><td className="p-3">Coûts R&D directs</td><td className="p-3 text-right">{fmt(cv(yearBudgetRD[0]), cur)}</td><td className="p-3 text-right">{fmt(cv(yearBudgetRD[1]), cur)}</td><td className="p-3 text-right">{fmt(cv(yearBudgetRD[2]), cur)}</td></tr>
              {yearBudgetOverhead.map((oh, i) => (
                <tr key={i} className="border-t border-gray-100"><td className="p-3">{oh.key}</td><td className="p-3 text-right">{fmt(cv(oh.y0), cur)}</td><td className="p-3 text-right">{fmt(cv(oh.y1), cur)}</td><td className="p-3 text-right">{fmt(cv(oh.y2), cur)}</td></tr>
              ))}
              <tr className="bg-gray-100 font-bold"><td className="p-3">Total Charges</td><td className="p-3 text-right">{fmt(cv(yearBudgetSalary[0] + yearBudgetRD[0] + yearBudgetOverhead.reduce((s, oh) => s + oh.y0, 0)), cur)}</td><td className="p-3 text-right">{fmt(cv(yearBudgetSalary[1] + yearBudgetRD[1] + yearBudgetOverhead.reduce((s, oh) => s + oh.y1, 0)), cur)}</td><td className="p-3 text-right">{fmt(cv(yearBudgetSalary[2] + yearBudgetRD[2] + yearBudgetOverhead.reduce((s, oh) => s + oh.y2, 0)), cur)}</td></tr>
              <tr className="bg-yellow-50 font-bold"><td className="p-3">Résultat</td><td className="p-3 text-right">{fmt(cv((yearBudgetRevenue.reduce((s, r) => s + r.y0, 0) + computed.cirCapped / 3) - (yearBudgetSalary[0] + yearBudgetRD[0] + yearBudgetOverhead.reduce((s, oh) => s + oh.y0, 0))), cur)}</td><td className="p-3 text-right">{fmt(cv((yearBudgetRevenue.reduce((s, r) => s + r.y1, 0) + computed.cirCapped / 3) - (yearBudgetSalary[1] + yearBudgetRD[1] + yearBudgetOverhead.reduce((s, oh) => s + oh.y1, 0))), cur)}</td><td className="p-3 text-right">{fmt(cv((yearBudgetRevenue.reduce((s, r) => s + r.y2, 0) + computed.cirCapped / 3) - (yearBudgetSalary[2] + yearBudgetRD[2] + yearBudgetOverhead.reduce((s, oh) => s + oh.y2, 0))), cur)}</td></tr>
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-bold text-gray-700 mb-4">Notes Budget</h3>
          <textarea value={notes.budget || ""} onChange={e => setNotes(prev => ({...prev, budget: e.target.value}))} className="w-full h-24 border rounded-lg p-3 text-sm" placeholder="Notes sur le budget..." />
        </div>
      </div>
    );
  };

  const HRTab = () => {
    const [expandedEmp, setExpandedEmp] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [showAddForm, setShowAddForm] = useState(false);
    const [showRaises, setShowRaises] = useState(false);

    const plannedHires = employees.filter(e => e.status === "Planifié").sort((a, b) => (a.plannedStartDate || "").localeCompare(b.plannedStartDate || ""));

    const startEdit = (e) => {
      setEditingId(e.id);
      setEditForm({...e});
    };

    const saveEdit = () => {
      setEmployees(prev => prev.map(e => e.id === editingId ? editForm : e));
      setEditingId(null);
    };

    const addEmployee = (form) => {
      const newEmp = { id: nextId(), ...form };
      setEmployees(prev => [...prev, newEmp]);
      setShowAddForm(false);
    };

    const deleteEmployee = (id) => {
      setEmployees(prev => prev.filter(e => e.id !== id));
    };

    const updateRaise = (empId, raise) => {
      setRaises(prev => ({...prev, [empId]: raise}));
    };

    return (
      <div className="space-y-6">
        <div className="flex gap-2 mb-4">
          <Btn onClick={() => setShowAddForm(!showAddForm)} variant="success"><Plus size={14} /> Ajouter un collaborateur</Btn>
          <Btn onClick={() => setShowRaises(!showRaises)} variant="primary">Augmentations</Btn>
        </div>

        {showAddForm && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
            <h3 className="font-bold mb-4">Nouveau collaborateur</h3>
            <div className="space-y-3">
              <Input placeholder="Nom" onChange={v => setEditForm({...editForm, name: v})} value={editForm.name || ""} />
              <Select options={DEPTS} value={editForm.dept || ""} onChange={v => setEditForm({...editForm, dept: v})} />
              <Select options={entities.map(e => ({label: e.name, value: e.id}))} value={editForm.entityId || ""} onChange={v => setEditForm({...editForm, entityId: parseInt(v)})} />
              <Select options={CONTRACTS} value={editForm.contract || ""} onChange={v => setEditForm({...editForm, contract: v})} />
              <Input type="number" placeholder="Salaire annuel" onChange={v => setEditForm({...editForm, salary: v})} value={editForm.salary || ""} />
              <Input type="number" placeholder="ETP (0-1)" onChange={v => setEditForm({...editForm, fte: v})} value={editForm.fte || ""} />
              <Input type="date" placeholder="Date de début" onChange={v => setEditForm({...editForm, startDate: v})} value={editForm.startDate || ""} />
              <Select options={STATUSES} value={editForm.status || "Actif"} onChange={v => setEditForm({...editForm, status: v})} />
              {editForm.status === "Planifié" && (
                <Input type="date" placeholder="Date de début planifiée" onChange={v => setEditForm({...editForm, plannedStartDate: v})} value={editForm.plannedStartDate || ""} />
              )}
              <div className="flex gap-2">
                <Btn onClick={() => addEmployee(editForm)} variant="success">Créer</Btn>
                <Btn onClick={() => setShowAddForm(false)} variant="ghost">Annuler</Btn>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {[
            { label: "Effectif actif (ETP)", value: computed.activeHC.toFixed(1), color: "#27AE60" },
            { label: "Effectif planifié (ETP)", value: computed.plannedHC.toFixed(1), color: "#F39C12" },
            { label: "Masse salariale annuelle", value: fmt(cv(computed.totalMasse), cur), color: "#E74C3C" },
          ].map((kpi, i) => (
            <KPICard key={i} icon={Users} label={kpi.label} value={kpi.value} color={kpi.color} />
          ))}
        </div>

        {plannedHires.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-sm font-bold text-gray-700 mb-4">Plan d'embauche</h3>
            <div className="space-y-2">
              {plannedHires.map(e => (
                <div key={e.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">{e.name}</div>
                    <div className="text-xs text-gray-500">{e.dept} — Départ: {e.plannedStartDate || "N/A"}</div>
                  </div>
                  <Badge text={fmt(cv(e.salary), cur)} color="blue" />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-bold text-gray-700 mb-4">Collaborateurs</h3>
          {computed.empCosts.map(e => (
            <div key={e.id} className="border-t border-gray-100 py-4">
              <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpandedEmp(expandedEmp === e.id ? null : e.id)}>
                <div className="flex-1">
                  <div className="font-medium">{e.name}</div>
                  <div className="text-xs text-gray-500">{e.dept} • {e.contract} • {e.comment}</div>
                </div>
                <div className="text-right mr-4">
                  <div className="font-bold">{fmt(cv(e.charged), cur)}</div>
                  <div className="text-xs text-gray-500">{e.fte.toFixed(1)} ETP</div>
                </div>
                <ChevronRight size={16} className={`transition ${expandedEmp === e.id ? "rotate-90" : ""}`} />
              </div>
              {expandedEmp === e.id && (
                <div className="mt-4 space-y-3 bg-gray-50 p-4 rounded-lg">
                  {editingId === e.id ? (
                    <>
                      <Input value={editForm.name || ""} onChange={v => setEditForm({...editForm, name: v})} placeholder="Nom" />
                      <Select value={editForm.dept || ""} onChange={v => setEditForm({...editForm, dept: v})} options={DEPTS} />
                      <Input type="number" value={editForm.salary || ""} onChange={v => setEditForm({...editForm, salary: v})} placeholder="Salaire" />
                      <Input type="number" value={editForm.fte || ""} onChange={v => setEditForm({...editForm, fte: v})} placeholder="ETP" />
                      <div className="flex gap-2">
                        <Btn onClick={saveEdit} variant="success">Sauvegarder</Btn>
                        <Btn onClick={() => setEditingId(null)} variant="ghost">Annuler</Btn>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div><span className="text-gray-600">Département:</span> <strong>{e.dept}</strong></div>
                        <div><span className="text-gray-600">Contrat:</span> <strong>{e.contract}</strong></div>
                        <div><span className="text-gray-600">Salaire:</span> <strong>{fmt(cv(e.salary), cur)}</strong></div>
                        <div><span className="text-gray-600">ETP:</span> <strong>{e.fte}</strong></div>
                        <div><span className="text-gray-600">Taux charges:</span> <strong>{fmtPct(e.tauxCharges)}</strong></div>
                        <div><span className="text-gray-600">Avantages:</span> <strong>{fmt(cv(e.benefits), cur)}</strong></div>
                      </div>
                      <div className="flex gap-2">
                        <Btn onClick={() => startEdit(e)} variant="primary"><Edit3 size={14} /> Éditer</Btn>
                        <Btn onClick={() => deleteEmployee(e.id)} variant="danger"><Trash2 size={14} /> Supprimer</Btn>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {showRaises && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-sm font-bold text-gray-700 mb-4">Augmentations individuelles</h3>
            {computed.empCosts.map(e => {
              const raise = raises[e.id] || { pct: 0, effectiveMonth: 0, comment: "" };
              return (
                <div key={e.id} className="border-t border-gray-100 py-3 px-3">
                  <div className="font-medium mb-2">{e.name}</div>
                  <div className="grid grid-cols-3 gap-2">
                    <Input type="number" placeholder="%" value={raise.pct * 100 || ""} onChange={v => updateRaise(e.id, {...raise, pct: (parseFloat(v) || 0) / 100})} />
                    <Input type="number" placeholder="Mois effectif" value={raise.effectiveMonth || ""} onChange={v => updateRaise(e.id, {...raise, effectiveMonth: parseFloat(v) || 0})} />
                    <Input placeholder="Commentaire" value={raise.comment || ""} onChange={v => updateRaise(e.id, {...raise, comment: v})} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-bold text-gray-700 mb-4">Notes RH</h3>
          <textarea value={notes.hr || ""} onChange={e => setNotes(prev => ({...prev, hr: e.target.value}))} className="w-full h-24 border rounded-lg p-3 text-sm" placeholder="Notes sur RH et effectifs..." />
        </div>
      </div>
    );
  };

  const RDTab = () => {
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [showAdd, setShowAdd] = useState(false);

    const startEdit = (p) => {
      setEditingId(p.id);
      setEditForm({...p});
    };

    const saveEdit = () => {
      setProjects(prev => prev.map(p => p.id === editingId ? editForm : p));
      setEditingId(null);
    };

    const addProject = (form) => {
      const newProj = { id: nextId(), ...form };
      setProjects(prev => [...prev, newProj]);
      setShowAdd(false);
    };

    const deleteProject = (id) => {
      setProjects(prev => prev.filter(p => p.id !== id));
    };

    const projectsByEntity = {};
    entities.forEach(e => { projectsByEntity[e.id] = []; });
    projects.forEach(p => { projectsByEntity[p.entityId] = (projectsByEntity[p.entityId] || []).concat(p); });

    return (
      <div className="space-y-6">
        <div className="flex gap-2 mb-4">
          <Btn onClick={() => setShowAdd(!showAdd)} variant="success"><Plus size={14} /> Nouveau projet R&D</Btn>
        </div>

        {showAdd && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
            <h3 className="font-bold mb-4">Nouveau projet</h3>
            <div className="space-y-3">
              <Input placeholder="Nom" onChange={v => setEditForm({...editForm, name: v})} value={editForm.name || ""} />
              <Select options={entities.map(e => ({label: e.name, value: e.id}))} value={editForm.entityId || ""} onChange={v => setEditForm({...editForm, entityId: parseInt(v)})} />
              <Input type="number" placeholder="CRO & Sous-traitance" onChange={v => setEditForm({...editForm, cro: v})} value={editForm.cro || ""} />
              <Input type="number" placeholder="Réactifs & Consommables" onChange={v => setEditForm({...editForm, reagents: v})} value={editForm.reagents || ""} />
              <Input type="number" placeholder="Équipements" onChange={v => setEditForm({...editForm, equipment: v})} value={editForm.equipment || ""} />
              <Input type="number" placeholder="IP / Brevets" onChange={v => setEditForm({...editForm, ip: v})} value={editForm.ip || ""} />
              <Input type="number" placeholder="Taux croissance annuel (%)" onChange={v => setEditForm({...editForm, growthRate: (parseFloat(v) || 0) / 100})} value={(editForm.growthRate || 0) * 100} />
              <div className="flex gap-2">
                <Btn onClick={() => addProject(editForm)} variant="success">Créer</Btn>
                <Btn onClick={() => setShowAdd(false)} variant="ghost">Annuler</Btn>
              </div>
            </div>
          </div>
        )}

        {Object.entries(projectsByEntity).map(([entId, projs]) => {
          if (projs.length === 0) return null;
          const ent = entities.find(e => e.id === parseInt(entId));
          return (
            <div key={entId} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{backgroundColor: ent.color}} />{ent.name}</h3>
              {projs.map(p => {
                const total = ["cro","reagents","equipment","ip","travel","other"].reduce((s, k) => s + (p[k] || 0), 0);
                return (
                  <div key={p.id} className="border-t border-gray-100 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{p.name}</div>
                        <div className="text-xs text-gray-500">Coût annuel: {fmt(cv(total), cur)} • Croissance: {fmtPct(p.growthRate || 0)}</div>
                      </div>
                      <div className="flex gap-2">
                        <Btn onClick={() => startEdit(p)} variant="primary"><Edit3 size={14} /></Btn>
                        <Btn onClick={() => deleteProject(p.id)} variant="danger"><Trash2 size={14} /></Btn>
                      </div>
                    </div>
                    {editingId === p.id && (
                      <div className="mt-4 space-y-3 bg-gray-50 p-4 rounded-lg">
                        <Input placeholder="Nom" value={editForm.name || ""} onChange={v => setEditForm({...editForm, name: v})} />
                        <Input type="number" placeholder="CRO" value={editForm.cro || ""} onChange={v => setEditForm({...editForm, cro: v})} />
                        <Input type="number" placeholder="Réactifs" value={editForm.reagents || ""} onChange={v => setEditForm({...editForm, reagents: v})} />
                        <Input type="number" placeholder="Équipements" value={editForm.equipment || ""} onChange={v => setEditForm({...editForm, equipment: v})} />
                        <Input type="number" placeholder="IP" value={editForm.ip || ""} onChange={v => setEditForm({...editForm, ip: v})} />
                        <div className="flex gap-2">
                          <Btn onClick={saveEdit} variant="success">Sauvegarder</Btn>
                          <Btn onClick={() => setEditingId(null)} variant="ghost">Annuler</Btn>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-bold text-gray-700 mb-4">Notes R&D</h3>
          <textarea value={notes.rd || ""} onChange={e => setNotes(prev => ({...prev, rd: e.target.value}))} className="w-full h-24 border rounded-lg p-3 text-sm" placeholder="Notes sur les coûts R&D..." />
        </div>
      </div>
    );
  };

  const EntitiesTab = () => {
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [showAdd, setShowAdd] = useState(false);

    const startEdit = (e) => {
      setEditingId(e.id);
      setEditForm({...e});
    };

    const saveEdit = () => {
      setEntities(prev => prev.map(e => e.id === editingId ? editForm : e));
      setEditingId(null);
    };

    const addEntity = (form) => {
      const newEnt = { id: Math.max(0, ...entities.map(e => e.id)) + 1, ...form };
      setEntities(prev => [...prev, newEnt]);
      setShowAdd(false);
    };

    const deleteEntity = (id) => {
      setEntities(prev => prev.filter(e => e.id !== id));
    };

    return (
      <div className="space-y-6">
        <div className="flex gap-2 mb-4">
          <Btn onClick={() => setShowAdd(!showAdd)} variant="success"><Plus size={14} /> Nouvelle entité</Btn>
        </div>

        {showAdd && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
            <h3 className="font-bold mb-4">Nouvelle entité</h3>
            <div className="space-y-3">
              <Input placeholder="Nom" onChange={v => setEditForm({...editForm, name: v})} value={editForm.name || ""} />
              <Select options={ENTITY_TYPES} value={editForm.type || ""} onChange={v => setEditForm({...editForm, type: v})} />
              <Input placeholder="SIREN" onChange={v => setEditForm({...editForm, siren: v})} value={editForm.siren || ""} />
              <div className="flex gap-2">
                <Btn onClick={() => addEntity(editForm)} variant="success">Créer</Btn>
                <Btn onClick={() => setShowAdd(false)} variant="ghost">Annuler</Btn>
              </div>
            </div>
          </div>
        )}

        {entities.map(e => (
          <div key={e.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-4 h-4 rounded-full" style={{backgroundColor: e.color}} />
              <h3 className="text-sm font-bold text-gray-700">{e.name}</h3>
              <Badge text={e.type} color="blue" />
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-600">SIREN:</span> {e.siren}</div>
              <div><span className="text-gray-600">Devise:</span> {e.currency}</div>
              <div><span className="text-gray-600">Date:</span> {e.date}</div>
              <div><span className="text-gray-600">Participation:</span> {e.participation}%</div>
            </div>
            <div className="flex gap-2 mt-4">
              <Btn onClick={() => startEdit(e)} variant="primary"><Edit3 size={14} /></Btn>
              <Btn onClick={() => deleteEntity(e.id)} variant="danger"><Trash2 size={14} /></Btn>
            </div>
            {editingId === e.id && (
              <div className="mt-4 space-y-3 bg-gray-50 p-4 rounded-lg">
                <Input placeholder="Nom" value={editForm.name || ""} onChange={v => setEditForm({...editForm, name: v})} />
                <Input placeholder="SIREN" value={editForm.siren || ""} onChange={v => setEditForm({...editForm, siren: v})} />
                <div className="flex gap-2">
                  <Btn onClick={saveEdit} variant="success">Sauvegarder</Btn>
                  <Btn onClick={() => setEditingId(null)} variant="ghost">Annuler</Btn>
                </div>
              </div>
            )}
          </div>
        ))}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-bold text-gray-700 mb-4">Notes entités</h3>
          <textarea value={notes.entities || ""} onChange={e => setNotes(prev => ({...prev, entities: e.target.value}))} className="w-full h-24 border rounded-lg p-3 text-sm" placeholder="Notes sur les entités..." />
        </div>
      </div>
    );
  };

  const ScenariosTab = () => {
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [showAdd, setShowAdd] = useState(false);

    const startEdit = (s) => {
      setEditingId(s.id);
      setEditForm({...s});
    };

    const saveEdit = () => {
      setScenarios(prev => prev.map(s => s.id === editingId ? editForm : s));
      setEditingId(null);
    };

    const addScenario = (form) => {
      const newSc = { id: "sc" + Math.random().toString(36).substr(2, 9), ...form };
      setScenarios(prev => [...prev, newSc]);
      setShowAdd(false);
    };

    const deleteScenario = (id) => {
      if (scenarios.length <= 1) return;
      setScenarios(prev => prev.filter(s => s.id !== id));
      if (activeScenarioId === id) setActiveScenarioId(scenarios.find(s => s.id !== id)?.id || "base");
    };

    return (
      <div className="space-y-6">
        <div className="flex gap-2 mb-4">
          <Btn onClick={() => setShowAdd(!showAdd)} variant="success"><Plus size={14} /> Nouveau scénario</Btn>
        </div>

        {showAdd && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
            <h3 className="font-bold mb-4">Nouveau scénario</h3>
            <div className="space-y-3">
              <Input placeholder="Nom du scénario" onChange={v => setEditForm({...editForm, name: v})} value={editForm.name || ""} />
              <div><label className="text-sm font-medium">Multiplicateur revenu:</label><Input type="number" placeholder="1.0" onChange={v => setEditForm({...editForm, revenueMultiplier: parseFloat(v) || 1.0})} value={editForm.revenueMultiplier || 1.0} step="0.1" /></div>
              <div><label className="text-sm font-medium">Multiplicateur coûts:</label><Input type="number" placeholder="1.0" onChange={v => setEditForm({...editForm, costMultiplier: parseFloat(v) || 1.0})} value={editForm.costMultiplier || 1.0} step="0.1" /></div>
              <Input type="number" placeholder="Ajustement effectif (+/- ETP)" onChange={v => setEditForm({...editForm, headcountAdj: parseFloat(v) || 0})} value={editForm.headcountAdj || 0} />
              <Input type="number" placeholder="Délai revenu (mois)" onChange={v => setEditForm({...editForm, delayMonths: parseFloat(v) || 0})} value={editForm.delayMonths || 0} />
              <textarea placeholder="Notes" onChange={e => setEditForm({...editForm, notes: e.target.value})} value={editForm.notes || ""} className="w-full h-16 border rounded-lg p-2 text-sm" />
              <div className="flex gap-2">
                <Btn onClick={() => addScenario(editForm)} variant="success">Créer</Btn>
                <Btn onClick={() => setShowAdd(false)} variant="ghost">Annuler</Btn>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-4">
          {scenarios.map(sc => (
            <div key={sc.id} className={`bg-white rounded-xl shadow-sm border p-5 cursor-pointer transition ${activeScenarioId === sc.id ? "border-blue-500 bg-blue-50" : "border-gray-100"}`} onClick={() => setActiveScenarioId(sc.id)}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-4 h-4 rounded-full" style={{backgroundColor: sc.color || "#2E5090"}} />
                <h3 className="text-sm font-bold text-gray-700 flex-1">{sc.name}</h3>
                {activeScenarioId === sc.id && <Badge text="Actif" color="green" />}
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                <div><span className="text-gray-600">Revenus:</span> <strong>×{sc.revenueMultiplier.toFixed(2)}</strong></div>
                <div><span className="text-gray-600">Coûts:</span> <strong>×{sc.costMultiplier.toFixed(2)}</strong></div>
                <div><span className="text-gray-600">HC:</span> <strong>{sc.headcountAdj > 0 ? "+" : ""}{sc.headcountAdj}</strong></div>
                <div><span className="text-gray-600">Délai:</span> <strong>{sc.delayMonths} mois</strong></div>
              </div>
              {sc.notes && <div className="text-xs text-gray-500 mb-3 p-2 bg-gray-50 rounded">{sc.notes}</div>}
              {sc.id !== "base" && (
                <div className="flex gap-2">
                  <Btn onClick={(e) => { e.stopPropagation(); startEdit(sc); }} variant="primary"><Edit3 size={14} /></Btn>
                  <Btn onClick={(e) => { e.stopPropagation(); deleteScenario(sc.id); }} variant="danger"><Trash2 size={14} /></Btn>
                </div>
              )}
              {editingId === sc.id && (
                <div className="mt-4 space-y-3 bg-gray-50 p-4 rounded-lg">
                  <Input placeholder="Nom" value={editForm.name || ""} onChange={v => setEditForm({...editForm, name: v})} />
                  <Input type="number" placeholder="Rev multiplier" value={editForm.revenueMultiplier || 1.0} onChange={v => setEditForm({...editForm, revenueMultiplier: parseFloat(v) || 1.0})} step="0.1" />
                  <Input type="number" placeholder="Cost multiplier" value={editForm.costMultiplier || 1.0} onChange={v => setEditForm({...editForm, costMultiplier: parseFloat(v) || 1.0})} step="0.1" />
                  <div className="flex gap-2">
                    <Btn onClick={saveEdit} variant="success">Sauvegarder</Btn>
                    <Btn onClick={() => setEditingId(null)} variant="ghost">Annuler</Btn>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-bold text-gray-700 mb-4">Notes scénarios</h3>
          <textarea value={notes.scenarios || ""} onChange={e => setNotes(prev => ({...prev, scenarios: e.target.value}))} className="w-full h-24 border rounded-lg p-3 text-sm" placeholder="Notes sur les scénarios..." />
        </div>
      </div>
    );
  };

  const SettingsTab = () => {
    const [openSec, setOpenSec] = useState("general");

    return (
      <div className="space-y-4">
        {[
          { id: "general", label: "Paramètres généraux", icon: Settings },
          { id: "charges", label: "Charges patronales", icon: Calculator },
          { id: "cir", label: "CIR / CII", icon: TrendingUp },
          { id: "delays", label: "Délais de paiement", icon: Calendar },
          { id: "fundraising", label: "Levées de fonds", icon: Wallet },
          { id: "alerts", label: "Seuils d'alerte", icon: AlertTriangle },
        ].map(sec => (
          <div key={sec.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div onClick={() => setOpenSec(openSec === sec.id ? null : sec.id)} className="p-5 cursor-pointer flex items-center justify-between hover:bg-gray-50">
              <div className="flex items-center gap-2"><sec.icon size={16} /><h3 className="font-bold text-gray-700">{sec.label}</h3></div>
              <ChevronDown size={16} className={`transition ${openSec === sec.id ? "rotate-180" : ""}`} />
            </div>
            {openSec === sec.id && (
              <div className="p-5 border-t border-gray-100 space-y-4">
                {sec.id === "general" && (
                  <>
                    <div><label className="text-sm font-medium">EUR/USD</label><Input type="number" value={settings.eurUsd || 1.08} onChange={v => setSettings(prev => ({...prev, eurUsd: v}))} step="0.01" /></div>
                    <div><label className="text-sm font-medium">Inflation annuelle (%)</label><Input type="number" value={(settings.inflation || 0) * 100} onChange={v => setSettings(prev => ({...prev, inflation: (parseFloat(v) || 0) / 100}))} step="0.1" /></div>
                    <div><label className="text-sm font-medium">Augmentation salaires (%)</label><Input type="number" value={(settings.salaryIncrease || 0) * 100} onChange={v => setSettings(prev => ({...prev, salaryIncrease: (parseFloat(v) || 0) / 100}))} step="0.1" /></div>
                  </>
                )}
                {sec.id === "cir" && (
                  <>
                    <div className="flex items-center gap-2"><input type="checkbox" checked={settings.cirEnabled} onChange={e => setSettings(prev => ({...prev, cirEnabled: e.target.checked}))} /> <span>Activer CIR/CII</span></div>
                    {settings.cirEnabled && (
                      <>
                        <div><label className="text-sm font-medium">Taux CIR (%)</label><Input type="number" value={(settings.cirRate || 0.30) * 100} onChange={v => setSettings(prev => ({...prev, cirRate: (parseFloat(v) || 0) / 100}))} step="0.1" /></div>
                        <div><label className="text-sm font-medium">Plafond CIR (€)</label><Input type="number" value={settings.cirPlafond || 100000000} onChange={v => setSettings(prev => ({...prev, cirPlafond: parseFloat(v) || 100000000}))} /></div>
                        <div><label className="text-sm font-medium">Délai encaissement (mois)</label><Input type="number" value={settings.cirDelayMonths || 12} onChange={v => setSettings(prev => ({...prev, cirDelayMonths: parseFloat(v) || 12}))} /></div>
                      </>
                    )}
                  </>
                )}
                {sec.id === "delays" && (
                  <>
                    <div><label className="text-sm font-medium">Subventions (mois)</label><Input type="number" value={settings.delays?.subventions || 3} onChange={v => setSettings(prev => ({...prev, delays: {...prev.delays, subventions: parseFloat(v) || 3}}))} /></div>
                    <div><label className="text-sm font-medium">CRO (mois)</label><Input type="number" value={settings.delays?.cro || 2} onChange={v => setSettings(prev => ({...prev, delays: {...prev.delays, cro: parseFloat(v) || 2}}))} /></div>
                    <div><label className="text-sm font-medium">Salaires (mois)</label><Input type="number" value={settings.delays?.salaires || 0} onChange={v => setSettings(prev => ({...prev, delays: {...prev.delays, salaires: parseFloat(v) || 0}}))} /></div>
                    <div><label className="text-sm font-medium">Charges sociales (mois)</label><Input type="number" value={settings.delays?.chargesSociales || 1} onChange={v => setSettings(prev => ({...prev, delays: {...prev.delays, chargesSociales: parseFloat(v) || 1}}))} /></div>
                    <div><label className="text-sm font-medium">Overhead (mois)</label><Input type="number" value={settings.delays?.overhead || 1} onChange={v => setSettings(prev => ({...prev, delays: {...prev.delays, overhead: parseFloat(v) || 1}}))} /></div>
                  </>
                )}
                {sec.id === "alerts" && (
                  <>
                    <div><label className="text-sm font-medium">Runway minimum (mois)</label><Input type="number" value={settings.alertThresholds?.minRunway || 12} onChange={v => setSettings(prev => ({...prev, alertThresholds: {...prev.alertThresholds, minRunway: parseFloat(v) || 12}}))} /></div>
                    <div><label className="text-sm font-medium">Runway critique (mois)</label><Input type="number" value={settings.alertThresholds?.minRunwayCritical || 6} onChange={v => setSettings(prev => ({...prev, alertThresholds: {...prev.alertThresholds, minRunwayCritical: parseFloat(v) || 6}}))} /></div>
                  </>
                )}
                {sec.id === "fundraising" && (
                  <>
                    <div><label className="text-sm font-medium">Montant cible (€)</label><Input type="number" value={settings.fundraising?.targetAmount || 15000000} onChange={v => setSettings(prev => ({...prev, fundraising: {...prev.fundraising, targetAmount: parseFloat(v) || 15000000}}))} /></div>
                    <div><label className="text-sm font-medium">Date cible (YYYY-MM)</label><Input value={settings.fundraising?.targetDate || "2027-06"} onChange={v => setSettings(prev => ({...prev, fundraising: {...prev.fundraising, targetDate: v}}))} /></div>
                    <div><label className="text-sm font-medium">Runway cible (mois)</label><Input type="number" value={settings.fundraising?.runway || 24} onChange={v => setSettings(prev => ({...prev, fundraising: {...prev.fundraising, runway: parseFloat(v) || 24}}))} /></div>
                  </>
                )}
              </div>
            )}
          </div>
        ))}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-bold text-gray-700 mb-4">Notes Hypothèses</h3>
          <textarea value={notes.settings || ""} onChange={e => setNotes(prev => ({...prev, settings: e.target.value}))} className="w-full h-24 border rounded-lg p-3 text-sm" placeholder="Notes sur les hypothèses..." />
        </div>
      </div>
    );
  };

  // ============================================================
  // EXPORT FUNCTIONS (PDF, PPTX, Excel via CDN)
  // ============================================================
  const loadScript = (src) => {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
      const script = document.createElement("script");
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  };

  const exportExcel = async () => {
    try {
      await loadScript("https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js");
      const XLSX = window.XLSX;
      const wb = XLSX.utils.book_new();

      // Budget sheet
      const budgetRows = [["Mois", ...MONTH_LABELS]];
      budgetRows.push(["Revenus", ...computed.revPerMonth36Adjusted]);
      budgetRows.push(["CIR", ...computed.cirReceived36]);
      budgetRows.push(["Personnel", ...computed.monthlySalary36]);
      computed.rdCostKeys.forEach(k => budgetRows.push([computed.rdCostLabels[k], ...computed.rdMonthly36[k]]));
      Object.entries(overhead).forEach(([key, arr]) => budgetRows.push([key, ...arr]));
      budgetRows.push(["Total Dépenses", ...computed.expPerMonth36]);
      budgetRows.push(["Net", ...computed.netPerMonth36]);
      budgetRows.push(["Solde Trésorerie", ...computed.cashFlow36.map(c => c.solde)]);
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(budgetRows), "Budget");

      // Personnel sheet
      const empRows = [["Nom","Département","Entité","Contrat","Salaire","Charges","Avantages","ETP","Statut"]];
      computed.empCosts.forEach(e => {
        const ent = entities.find(en => en.id === e.entityId);
        empRows.push([e.name, e.dept, ent?.name || "", e.contract, e.salary, Math.round(e.charges.total), e.benefits, e.fte, e.status]);
      });
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(empRows), "Personnel");

      // R&D sheet
      const rdRows = [["Projet","Entité","CRO","Réactifs","Équipements","PI","Déplacements","Autres","Total"]];
      projects.forEach(p => {
        const ent = entities.find(e => e.id === p.entityId);
        const total = ["cro","reagents","equipment","ip","travel","other"].reduce((s,k) => s + (p[k]||0), 0);
        rdRows.push([p.name, ent?.name||"", p.cro, p.reagents, p.equipment, p.ip, p.travel, p.other, total]);
      });
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rdRows), "R&D");

      // Cash Flow sheet
      const cfRows = [["Mois","Revenus","CIR","Dépenses","Net","Solde"]];
      computed.cashFlow36.forEach(c => cfRows.push([c.month, c.revenus, c.cir, c.depenses, c.net, c.solde]));
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(cfRows), "Cash Flow");

      // Scenarios sheet
      const scRows = [["Scénario","Multiplicateur Revenus","Multiplicateur Coûts","Adj. Effectifs","Notes"]];
      scenarios.forEach(s => scRows.push([s.name, s.revenueMultiplier, s.costMultiplier, s.headcountAdj, s.notes]));
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(scRows), "Scénarios");

      XLSX.writeFile(wb, `BioTech_Budget_${new Date().toISOString().slice(0,10)}.xlsx`);
    } catch(err) { console.error("Export Excel error:", err); alert("Erreur lors de l'export Excel"); }
  };

  const exportPPTX = async () => {
    try {
      await loadScript("https://cdn.jsdelivr.net/npm/pptxgenjs@3.12.0/dist/pptxgenjs.bundle.js");
      const pptx = new window.PptxGenJS();
      pptx.layout = "LAYOUT_WIDE";

      // Title slide
      let slide = pptx.addSlide();
      slide.addText("BioTech — Pilotage Financier", { x: 1, y: 1.5, w: 11, h: 1.5, fontSize: 36, bold: true, color: "2E5090" });
      slide.addText(`Budget pluriannuel 2026-2028 | Scénario: ${activeScenario.name} | ${new Date().toLocaleDateString("fr-FR")}`, { x: 1, y: 3, w: 11, h: 0.8, fontSize: 16, color: "666666" });

      // KPI slide
      slide = pptx.addSlide();
      slide.addText("KPIs — Vue d'ensemble", { x: 0.5, y: 0.3, w: 12, h: 0.7, fontSize: 24, bold: true, color: "2E5090" });
      const kpis = [
        ["Trésorerie", fmt(computed.currentCash)],
        ["Burn rate / mois", fmt(computed.avgBurn)],
        ["Runway", `${computed.runway.toFixed(1)} mois`],
        ["Effectifs (ETP)", computed.activeHC.toFixed(1)],
        ["CIR estimé", fmt(computed.cirCapped)],
        ["Dépenses totales 3 ans", fmt(computed.totalExpenses)],
      ];
      kpis.forEach(([label, value], i) => {
        const col = i % 3, row = Math.floor(i / 3);
        slide.addText(label, { x: 0.5 + col * 4, y: 1.2 + row * 1.8, w: 3.5, h: 0.5, fontSize: 12, color: "666666" });
        slide.addText(value, { x: 0.5 + col * 4, y: 1.7 + row * 1.8, w: 3.5, h: 0.6, fontSize: 20, bold: true, color: "2E5090" });
      });

      // Budget summary slide
      slide = pptx.addSlide();
      slide.addText("Budget consolidé par année", { x: 0.5, y: 0.3, w: 12, h: 0.7, fontSize: 24, bold: true, color: "2E5090" });
      const yearSummary = YEARS.map((yr, yi) => {
        const start = yi * 12, end = start + 12;
        const rev = computed.revPerMonth36Adjusted.slice(start, end).reduce((a,b) => a+b, 0);
        const exp = computed.expPerMonth36.slice(start, end).reduce((a,b) => a+b, 0);
        return [String(yr), fmt(rev), fmt(exp), fmt(rev - exp)];
      });
      slide.addTable([["Année", "Revenus", "Dépenses", "Net"], ...yearSummary], {
        x: 0.5, y: 1.2, w: 12, colW: [2, 3.3, 3.3, 3.3],
        border: { type: "solid", pt: 0.5, color: "cccccc" },
        rowH: 0.6, fontSize: 14,
        headerRow: true,
        autoPage: false,
      });

      // Team slide
      slide = pptx.addSlide();
      slide.addText("Équipe & Effectifs", { x: 0.5, y: 0.3, w: 12, h: 0.7, fontSize: 24, bold: true, color: "2E5090" });
      const teamRows = computed.empCosts.map(e => [e.name, e.dept, e.contract, fmt(e.salary), e.fte.toString()]);
      slide.addTable([["Nom", "Département", "Contrat", "Salaire", "ETP"], ...teamRows.slice(0, 15)], {
        x: 0.5, y: 1.2, w: 12, colW: [3, 2.5, 1.5, 2.5, 1.5],
        border: { type: "solid", pt: 0.5, color: "cccccc" },
        rowH: 0.45, fontSize: 11,
        headerRow: true,
        autoPage: false,
      });

      pptx.writeFile({ fileName: `BioTech_Board_Pack_${new Date().toISOString().slice(0,10)}.pptx` });
    } catch(err) { console.error("Export PPTX error:", err); alert("Erreur lors de l'export PowerPoint"); }
  };

  const exportPDF = async () => {
    try {
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.2/jspdf.umd.min.js");
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js");
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

      // Title
      doc.setFontSize(22);
      doc.setTextColor(46, 80, 144);
      doc.text("BioTech — Pilotage Financier", 15, 20);
      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text(`Scénario: ${activeScenario.name} | ${new Date().toLocaleDateString("fr-FR")}`, 15, 28);

      // KPIs
      doc.setFontSize(14);
      doc.setTextColor(46, 80, 144);
      doc.text("Indicateurs clés", 15, 40);
      doc.autoTable({
        startY: 45,
        head: [["Indicateur", "Valeur"]],
        body: [
          ["Trésorerie finale", fmt(computed.currentCash)],
          ["Burn rate mensuel", fmt(computed.avgBurn)],
          ["Runway", `${computed.runway.toFixed(1)} mois`],
          ["Effectifs actifs (ETP)", computed.activeHC.toFixed(1)],
          ["CIR estimé annuel", fmt(computed.cirCapped)],
          ["Revenus totaux 3 ans", fmt(computed.totalRevenue)],
          ["Dépenses totales 3 ans", fmt(computed.totalExpenses)],
        ],
        theme: "grid",
        headStyles: { fillColor: [46, 80, 144] },
        margin: { left: 15 },
      });

      // Budget by year
      doc.addPage();
      doc.setFontSize(14);
      doc.setTextColor(46, 80, 144);
      doc.text("Budget consolidé par année", 15, 20);
      const yearRows = YEARS.map((yr, yi) => {
        const s = yi * 12, e = s + 12;
        const rev = computed.revPerMonth36Adjusted.slice(s, e).reduce((a,b) => a+b, 0);
        const sal = computed.monthlySalary36.slice(s, e).reduce((a,b) => a+b, 0);
        const rd = computed.rdPerMonth36.slice(s, e).reduce((a,b) => a+b, 0);
        const oh = computed.overheadPerMonth36.slice(s, e).reduce((a,b) => a+b, 0);
        const exp = computed.expPerMonth36.slice(s, e).reduce((a,b) => a+b, 0);
        return [String(yr), fmtNum(Math.round(rev)), fmtNum(Math.round(sal)), fmtNum(Math.round(rd)), fmtNum(Math.round(oh)), fmtNum(Math.round(exp)), fmtNum(Math.round(rev - exp))];
      });
      doc.autoTable({
        startY: 25,
        head: [["Année", "Revenus", "Personnel", "R&D", "Overhead", "Total Dép.", "Net"]],
        body: yearRows,
        theme: "grid",
        headStyles: { fillColor: [46, 80, 144] },
        margin: { left: 15 },
      });

      // Team
      doc.addPage();
      doc.setFontSize(14);
      doc.setTextColor(46, 80, 144);
      doc.text("Effectifs & Masse salariale", 15, 20);
      doc.autoTable({
        startY: 25,
        head: [["Nom", "Département", "Contrat", "Salaire brut", "Charges", "ETP", "Statut"]],
        body: computed.empCosts.map(e => [e.name, e.dept, e.contract, fmtNum(e.salary), fmtNum(Math.round(e.charges.total)), e.fte.toString(), e.status]),
        theme: "grid",
        headStyles: { fillColor: [39, 174, 96] },
        margin: { left: 15 },
        styles: { fontSize: 9 },
      });

      doc.save(`BioTech_Report_${new Date().toISOString().slice(0,10)}.pdf`);
    } catch(err) { console.error("Export PDF error:", err); alert("Erreur lors de l'export PDF"); }
  };

  const [showExportMenu, setShowExportMenu] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tableau de bord financier — BioTech</h1>
            <p className="text-sm text-gray-500 mt-1">Planification pluriannuelle (2026-2028)</p>
          </div>
          <div className="flex gap-3 items-center">
            <div className="flex bg-white rounded-lg shadow-sm p-1 border border-gray-200">
              <button onClick={() => setShowCurrency("EUR")} className={`px-3 py-2 rounded text-sm font-medium transition ${showCurrency === "EUR" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}><Euro size={14} className="mr-1 inline" /> EUR</button>
              <button onClick={() => setShowCurrency("USD")} className={`px-3 py-2 rounded text-sm font-medium transition ${showCurrency === "USD" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}><DollarSign size={14} className="mr-1 inline" /> USD</button>
            </div>
            <Select options={scenarios.map(s => ({label: s.name, value: s.id}))} value={activeScenarioId} onChange={setActiveScenarioId} className="max-w-xs" />
            <div className="relative">
              <button onClick={() => setShowExportMenu(!showExportMenu)} className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm">
                <Download size={14} /> Exporter
              </button>
              {showExportMenu && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1 min-w-48">
                  <button onClick={() => { exportPDF(); setShowExportMenu(false); }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2">
                    <FileSpreadsheet size={14} className="text-red-500" /> Export PDF — Synthèse
                  </button>
                  <button onClick={() => { exportPPTX(); setShowExportMenu(false); }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2">
                    <FileSpreadsheet size={14} className="text-orange-500" /> Export PowerPoint — Board Pack
                  </button>
                  <button onClick={() => { exportExcel(); setShowExportMenu(false); }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2">
                    <FileSpreadsheet size={14} className="text-green-500" /> Export Excel — Données complètes
                  </button>
                </div>
              )}
            </div>
            <SaveStatus status={saveStatus} lastSaved={lastSaved} />
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { id: "dashboard", icon: Wallet, label: "Tableau de bord" },
            { id: "budget", icon: FileSpreadsheet, label: "Budget" },
            { id: "hr", icon: Users, label: "RH & Effectifs" },
            { id: "rd", icon: FlaskConical, label: "Coûts R&D" },
            { id: "entities", icon: Building2, label: "Entités" },
            { id: "scenarios", icon: TrendingUp, label: "Scénarios" },
            { id: "settings", icon: Settings, label: "Hypothèses" },
          ].map(t => (
            <TabBtn key={t.id} active={tab === t.id} onClick={() => setTab(t.id)} icon={t.icon} label={t.label} />
          ))}
        </div>

        {tab === "dashboard" && <DashboardTab />}
        {tab === "budget" && <BudgetTab />}
        {tab === "hr" && <HRTab />}
        {tab === "rd" && <RDTab />}
        {tab === "entities" && <EntitiesTab />}
        {tab === "scenarios" && <ScenariosTab />}
        {tab === "settings" && <SettingsTab />}
      </div>
    </div>
  );
}
