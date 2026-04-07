/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Baby, 
  User, 
  Dog, 
  Cat, 
  Stethoscope, 
  Trophy, 
  Briefcase, 
  Heart, 
  ArrowRight, 
  RotateCcw, 
  CheckCircle2,
  Info,
  Scale,
  Globe,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer 
} from 'recharts';

// --- Types ---

type CharacterType = 'human' | 'animal';
type AgeGroup = 'young' | 'adult' | 'elderly';

interface Character {
  id: string;
  name: string;
  icon: React.ReactNode;
  type: CharacterType;
  age: AgeGroup;
  weight: number; // For internal logic, not shown to user
  isProfessional?: boolean;
  context: string; // New: Hidden context revealed on hover
}

interface ScenarioOption {
  id: 'A' | 'B';
  description: string;
  characters: Character[];
  isDeviation: boolean; // Does the car deviate or stay on path?
  isLegal: boolean; // New: Are they crossing correctly?
  globalVote: number; // New: Simulated community vote percentage
}

interface Scenario {
  id: number;
  optionA: ScenarioOption;
  optionB: ScenarioOption;
}

interface Choice {
  scenario: Scenario;
  selectedOption: ScenarioOption;
  sliderValue: number; // 0-100 (0 = A, 100 = B)
}

// --- Constants & Data ---

const CONTEXTS = [
  "Cientista trabalhando na cura do câncer",
  "Pessoa atravessando fora da faixa",
  "Pessoa atravessando na faixa de pedestres",
  "Criminoso foragido da justiça",
  "Voluntário em um abrigo de animais",
  "Pessoa com deficiência física",
  "Turista perdido na cidade",
  "Pessoa sob efeito de substâncias",
  "Estudante de medicina promissor",
  "Pessoa idosa com Alzheimer",
  "Criança brincando com uma bola",
  "Atleta olímpico em treinamento",
  "Pessoa desempregada procurando trabalho",
  "Empresário de sucesso",
  "Pessoa que acabou de ganhar na loteria",
];

const CHARACTERS: Character[] = [
  { id: 'boy', name: 'Menino', icon: <Baby className="w-6 h-6" />, type: 'human', age: 'young', weight: 10, context: "" },
  { id: 'girl', name: 'Menina', icon: <Baby className="w-6 h-6" />, type: 'human', age: 'young', weight: 10, context: "" },
  { id: 'man', name: 'Homem', icon: <User className="w-6 h-6" />, type: 'human', age: 'adult', weight: 5, context: "" },
  { id: 'woman', name: 'Mulher', icon: <User className="w-6 h-6" />, type: 'human', age: 'adult', weight: 5, context: "" },
  { id: 'elderly_man', name: 'Idoso', icon: <Users className="w-6 h-6" />, type: 'human', age: 'elderly', weight: 3, context: "" },
  { id: 'elderly_woman', name: 'Idosa', icon: <Users className="w-6 h-6" />, type: 'human', age: 'elderly', weight: 3, context: "" },
  { id: 'doctor', name: 'Médico(a)', icon: <Stethoscope className="w-6 h-6" />, type: 'human', age: 'adult', weight: 8, isProfessional: true, context: "" },
  { id: 'athlete', name: 'Atleta', icon: <Trophy className="w-6 h-6" />, type: 'human', age: 'adult', weight: 6, isProfessional: true, context: "" },
  { id: 'business', name: 'Executivo(a)', icon: <Briefcase className="w-6 h-6" />, type: 'human', age: 'adult', weight: 6, isProfessional: true, context: "" },
  { id: 'dog', name: 'Cão', icon: <Dog className="w-6 h-6" />, type: 'animal', age: 'adult', weight: 1, context: "Animal de estimação leal" },
  { id: 'cat', name: 'Gato', icon: <Cat className="w-6 h-6" />, type: 'animal', age: 'adult', weight: 1, context: "Gato de rua independente" },
];

const TOTAL_SCENARIOS = 10;

// --- Helper Functions ---

const generateRandomScenario = (id: number): Scenario => {
  const getRandomCharacters = (count: number) => {
    const chars: Character[] = [];
    for (let i = 0; i < count; i++) {
      const baseChar = CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
      chars.push({
        ...baseChar,
        context: baseChar.context || CONTEXTS[Math.floor(Math.random() * CONTEXTS.length)]
      });
    }
    return chars;
  };

  const countA = Math.floor(Math.random() * 3) + 1;
  const countB = Math.floor(Math.random() * 3) + 1;
  const globalVoteA = Math.floor(Math.random() * 60) + 20; // 20% to 80%

  return {
    id,
    optionA: {
      id: 'A',
      description: 'O carro segue em frente na sua faixa.',
      characters: getRandomCharacters(countA),
      isDeviation: false,
      isLegal: Math.random() > 0.5,
      globalVote: globalVoteA,
    },
    optionB: {
      id: 'B',
      description: 'O carro desvia para a outra faixa.',
      characters: getRandomCharacters(countB),
      isDeviation: true,
      isLegal: Math.random() > 0.5,
      globalVote: 100 - globalVoteA,
    },
  };
};

// --- Components ---

function CharacterIcon({ char }: { char: Character, key?: string }) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div 
      className="relative flex flex-col items-center p-2 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20 cursor-help group"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {char.icon}
      <span className="text-[10px] mt-1 font-medium uppercase tracking-wider opacity-80">{char.name}</span>
      
      <AnimatePresence>
        {showTooltip && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-slate-900 border border-indigo-500/30 rounded-xl shadow-2xl z-[100] text-center pointer-events-none"
          >
            <p className="text-xs font-bold text-indigo-400 mb-1 uppercase tracking-widest">Contexto</p>
            <p className="text-xs text-slate-200 leading-relaxed">{char.context}</p>
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ScenarioCard({ 
  option, 
  isActive,
  showGlobalResult
}: { 
  option: ScenarioOption; 
  isActive: boolean;
  showGlobalResult: boolean;
}) {
  return (
    <div
      className={`relative flex flex-col w-full p-6 rounded-2xl transition-all duration-500 border-2 ${
        isActive 
          ? 'bg-indigo-600/20 border-indigo-500 shadow-xl shadow-indigo-500/10' 
          : 'bg-slate-800/30 border-slate-700 opacity-60 grayscale-[0.5]'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${
          option.id === 'A' ? 'bg-amber-500 text-amber-950' : 'bg-emerald-500 text-emerald-950'
        }`}>
          Cenário {option.id}
        </span>
        {option.isLegal ? (
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Na Faixa
          </span>
        ) : (
          <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Fora da Faixa
          </span>
        )}
      </div>
      
      <p className="text-lg font-medium text-slate-200 mb-6 text-left">
        {option.description}
      </p>

      <div className="mt-auto">
        <p className="text-xs text-slate-400 mb-3 uppercase tracking-widest font-semibold">Vítimas potenciais:</p>
        <div className="flex flex-wrap gap-2">
          {option.characters.map((char, idx) => (
            <CharacterIcon key={`${char.id}-${idx}`} char={char} />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {showGlobalResult && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-6 text-center z-10"
          >
            <Globe className="w-8 h-8 text-indigo-400 mb-2" />
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Voto da Comunidade</p>
            <p className="text-5xl font-black text-white my-2">{option.globalVote}%</p>
            <p className="text-xs text-slate-400">das pessoas escolheram este cenário</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [choices, setChoices] = useState<Choice[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [sliderValue, setSliderValue] = useState(50);
  const [showGlobalResult, setShowGlobalResult] = useState(false);

  useEffect(() => {
    const initialScenarios = Array.from({ length: TOTAL_SCENARIOS }, (_, i) => generateRandomScenario(i + 1));
    setScenarios(initialScenarios);
  }, []);

  const handleConfirm = () => {
    if (showGlobalResult) {
      // Move to next scenario
      if (currentIndex < TOTAL_SCENARIOS - 1) {
        setCurrentIndex(currentIndex + 1);
        setSliderValue(50);
        setShowGlobalResult(false);
      } else {
        setIsFinished(true);
      }
      return;
    }

    // Show global result first
    const scenario = scenarios[currentIndex];
    const selectedOption = sliderValue < 50 ? scenario.optionA : scenario.optionB;
    
    const newChoice: Choice = {
      scenario,
      selectedOption,
      sliderValue
    };
    
    setChoices([...choices, newChoice]);
    setShowGlobalResult(true);
  };

  const reset = () => {
    const initialScenarios = Array.from({ length: TOTAL_SCENARIOS }, (_, i) => generateRandomScenario(i + 1));
    setScenarios(initialScenarios);
    setCurrentIndex(0);
    setChoices([]);
    setIsFinished(false);
    setSliderValue(50);
    setShowGlobalResult(false);
  };

  const radarData = useMemo(() => {
    if (!isFinished) return [];

    const scores = {
      utilitarismo: 0, // Salva mais vidas
      especismo: 0,    // Prioriza humanos
      idadismo: 0,     // Prioriza jovens
      legalismo: 0,    // Prioriza quem está na faixa
      decisividade: 0, // Certeza nas escolhas (distância do centro do slider)
    };

    choices.forEach((choice) => {
      const scenario = choice.scenario;
      const selected = choice.selectedOption;
      const other = selected.id === 'A' ? scenario.optionB : scenario.optionA;

      // Utilitarismo
      if (selected.characters.length > other.characters.length) scores.utilitarismo += 10;
      else if (selected.characters.length < other.characters.length) scores.utilitarismo -= 5;

      // Especismo
      const selHumans = selected.characters.filter(c => c.type === 'human').length;
      const othHumans = other.characters.filter(c => c.type === 'human').length;
      if (selHumans > othHumans) scores.especismo += 10;
      else if (selHumans < othHumans) scores.especismo -= 5;

      // Idadismo
      const selYoung = selected.characters.filter(c => c.age === 'young').length;
      const othYoung = other.characters.filter(c => c.age === 'young').length;
      if (selYoung > othYoung) scores.idadismo += 10;
      else if (selYoung < othYoung) scores.idadismo -= 5;

      // Legalismo
      if (selected.isLegal && !other.isLegal) scores.legalismo += 10;
      else if (!selected.isLegal && other.isLegal) scores.legalismo -= 5;

      // Decisividade
      scores.decisividade += Math.abs(choice.sliderValue - 50) * 2;
    });

    const normalize = (val: number) => Math.max(20, Math.min(100, (val / TOTAL_SCENARIOS) * 10 + 50));

    return [
      { subject: 'Utilitarismo', A: normalize(scores.utilitarismo), fullMark: 100 },
      { subject: 'Especismo', A: normalize(scores.especismo), fullMark: 100 },
      { subject: 'Idadismo', A: normalize(scores.idadismo), fullMark: 100 },
      { subject: 'Legalismo', A: normalize(scores.legalismo), fullMark: 100 },
      { subject: 'Decisividade', A: Math.min(100, scores.decisividade / TOTAL_SCENARIOS), fullMark: 100 },
    ];
  }, [isFinished, choices]);

  if (scenarios.length === 0) return null;

  const currentScenario = scenarios[currentIndex];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-indigo-500/30">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Heart className="w-6 h-6 text-white fill-white/20" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Protocolo de Sacrifício</h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Dilemas Éticos de IA</p>
            </div>
          </div>
          {!isFinished && (
            <div className="flex items-center gap-4">
              <div className="hidden sm:block text-right">
                <p className="text-xs text-slate-400 font-medium">Progresso</p>
                <p className="text-sm font-bold text-indigo-400">{currentIndex + 1} de {TOTAL_SCENARIOS}</p>
              </div>
              <div className="w-32 h-2 bg-slate-800 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-indigo-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentIndex + 1) / TOTAL_SCENARIOS) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {!isFinished ? (
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              <div className="text-center max-w-2xl mx-auto space-y-4">
                <h2 className="text-3xl font-bold text-white sm:text-4xl">O que o carro deve fazer?</h2>
                <p className="text-slate-400 text-lg">
                  Um veículo autônomo está prestes a sofrer uma falha nos freios. 
                  Use o slider para indicar sua decisão e o nível de certeza.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch relative">
                <ScenarioCard 
                  option={currentScenario.optionA} 
                  isActive={sliderValue < 50}
                  showGlobalResult={showGlobalResult}
                />
                <ScenarioCard 
                  option={currentScenario.optionB} 
                  isActive={sliderValue > 50}
                  showGlobalResult={showGlobalResult}
                />
              </div>

              {/* Slider UI */}
              <div className="max-w-2xl mx-auto space-y-8">
                <div className="relative pt-12 pb-4">
                  <div className="absolute top-0 left-0 text-xs font-bold text-amber-500 uppercase tracking-widest">Certeza Absoluta (A)</div>
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 text-xs font-bold text-slate-500 uppercase tracking-widest">Dilema Total</div>
                  <div className="absolute top-0 right-0 text-xs font-bold text-emerald-500 uppercase tracking-widest">Certeza Absoluta (B)</div>
                  
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={sliderValue}
                    onChange={(e) => !showGlobalResult && setSliderValue(parseInt(e.target.value))}
                    disabled={showGlobalResult}
                    className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                  
                  <div className="flex justify-between mt-4 text-[10px] text-slate-500 font-medium uppercase tracking-tighter">
                    <span>Priorizar Cenário A</span>
                    <span>Indecisão</span>
                    <span>Priorizar Cenário B</span>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleConfirm}
                    className={`px-12 py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-2xl ${
                      showGlobalResult 
                        ? 'bg-indigo-500 text-white shadow-indigo-500/20' 
                        : 'bg-white text-slate-950 hover:bg-indigo-50 shadow-white/10'
                    }`}
                  >
                    {showGlobalResult ? (
                      <span className="flex items-center gap-2">Próximo Dilema <ArrowRight className="w-5 h-5" /></span>
                    ) : (
                      <span className="flex items-center gap-2"><Scale className="w-5 h-5" /> Confirmar Escolha</span>
                    )}
                  </motion.button>
                  
                  {!showGlobalResult && (
                    <div className="flex items-center gap-2 text-slate-500 text-xs italic">
                      <Info className="w-4 h-4" />
                      <span>Passe o mouse sobre os personagens para ver o contexto</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-4xl mx-auto"
            >
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl">
                <div className="text-center space-y-4 mb-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500/10 rounded-full mb-4">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                  </div>
                  <h2 className="text-4xl font-bold text-white">Seu Perfil Moral</h2>
                  <p className="text-slate-400 text-lg">
                    Análise profunda baseada em suas decisões e níveis de incerteza.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  {/* Radar Chart */}
                  <div className="h-[400px] w-full bg-slate-800/20 rounded-3xl p-4 border border-slate-800 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                        <PolarGrid stroke="#334155" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 'bold' }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar
                          name="Você"
                          dataKey="A"
                          stroke="#6366f1"
                          fill="#6366f1"
                          fillOpacity={0.5}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Insights */}
                  <div className="space-y-8">
                    <h3 className="text-xl font-bold text-indigo-400 uppercase tracking-widest">Observações da IA</h3>
                    <div className="space-y-4">
                      <InsightItem 
                        title="Decisividade" 
                        desc={radarData.find(d => d.subject === 'Decisividade')?.A! > 70 
                          ? "Você toma decisões rápidas e firmes, mesmo em situações extremas." 
                          : "Você demonstra grande empatia e dificuldade em sacrificar qualquer vida."} 
                      />
                      <InsightItem 
                        title="Fator Humano" 
                        desc={radarData.find(d => d.subject === 'Especismo')?.A! > 60 
                          ? "Sua bússola moral prioriza fortemente a vida humana sobre outras espécies." 
                          : "Você vê um valor intrínseco quase igual em todas as formas de vida sencientes."} 
                      />
                      <InsightItem 
                        title="Justiça vs. Misericórdia" 
                        desc={radarData.find(d => d.subject === 'Legalismo')?.A! > 60 
                          ? "Para você, as regras e a ordem social são fundamentais na tomada de decisão." 
                          : "Você tende a ignorar as regras em favor do que sente ser o resultado mais humano."} 
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button
                    onClick={reset}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20"
                  >
                    <RotateCcw className="w-5 h-5" />
                    Refazer Protocolo
                  </button>
                  <button
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all"
                  >
                    Exportar Relatório Ético
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="max-w-5xl mx-auto px-6 py-12 text-center text-slate-500 text-sm border-t border-slate-900">
        <p>© 2026 Protocolo de Sacrifício Clone. Inspirado no projeto original do MIT Media Lab.</p>
        <p className="mt-2">Este é um experimento educacional sobre ética e inteligência artificial.</p>
      </footer>
    </div>
  );
}

const InsightItem = ({ title, desc }: { title: string, desc: string }) => (
  <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700">
    <p className="text-sm font-bold text-white mb-1">{title}</p>
    <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
  </div>
);
