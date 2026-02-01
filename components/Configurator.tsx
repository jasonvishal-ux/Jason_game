
import React, { useState, useEffect } from 'react';
import { CAR_MODELS, COLORS, PERFORMANCE_TIERS } from '../constants';
import { UserConfig, AISpecs } from '../types';
import { getCarSpecs } from '../services/geminiService';
import { ChevronRight, ChevronLeft, Zap, Shield, Gauge, Info, Loader2 } from 'lucide-react';

interface Props {
  onComplete: (config: UserConfig, specs: AISpecs) => void;
}

const Configurator: React.FC<Props> = ({ onComplete }) => {
  const [selectedCarIdx, setSelectedCarIdx] = useState(0);
  const [selectedColor, setSelectedColor] = useState(COLORS[1]); // Default to Red
  const [performance, setPerformance] = useState<'Stock' | 'Sport' | 'Race'>('Stock');
  const [loading, setLoading] = useState(false);
  const [aiSpecs, setAiSpecs] = useState<AISpecs | null>(null);

  const currentCar = CAR_MODELS[selectedCarIdx];

  useEffect(() => {
    fetchSpecs();
  }, [selectedCarIdx, selectedColor, performance]);

  const fetchSpecs = async () => {
    setLoading(true);
    const config: UserConfig = {
      car: currentCar,
      color: selectedColor.name,
      colorHex: selectedColor.hex,
      wheels: 'Standard',
      performanceTier: performance,
    };
    const specs = await getCarSpecs(config);
    setAiSpecs(specs);
    setLoading(false);
  };

  const handleNextCar = () => setSelectedCarIdx((prev) => (prev + 1) % CAR_MODELS.length);
  const handlePrevCar = () => setSelectedCarIdx((prev) => (prev - 1 + CAR_MODELS.length) % CAR_MODELS.length);

  const handleFinalize = () => {
    if (aiSpecs) {
      onComplete({
        car: currentCar,
        color: selectedColor.name,
        colorHex: selectedColor.hex,
        wheels: 'Standard',
        performanceTier: performance,
      }, aiSpecs);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-full w-full bg-black text-white overflow-hidden">
      <div className="w-full lg:w-1/3 p-8 flex flex-col gap-6 bg-zinc-900/50 backdrop-blur-md border-r border-zinc-800 overflow-y-auto z-20">
        <div>
          <h1 className="text-4xl font-orbitron font-black italic tracking-tighter text-red-600 mb-1 leading-none">VELOCITY AI</h1>
          <p className="text-zinc-400 text-[10px] uppercase tracking-[0.2em] font-bold">Premium Configurator</p>
        </div>

        <section>
          <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-3 block">Chassis Selection</label>
          <div className="flex items-center justify-between bg-zinc-800/80 p-3 rounded-xl border border-zinc-700/50">
            <button onClick={handlePrevCar} className="p-2 hover:bg-zinc-700 rounded-lg transition-colors text-zinc-400 hover:text-white">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="text-center">
              <div className="text-[10px] text-red-500 font-black uppercase tracking-tighter">{currentCar.brand}</div>
              <div className="text-lg font-orbitron tracking-tight leading-tight">{currentCar.name}</div>
            </div>
            <button onClick={handleNextCar} className="p-2 hover:bg-zinc-700 rounded-lg transition-colors text-zinc-400 hover:text-white">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </section>

        <section>
          <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-3 block">Bespoke Paint</label>
          <div className="grid grid-cols-6 gap-2">
            {COLORS.map((c) => (
              <button
                key={c.name}
                onClick={() => setSelectedColor(c)}
                className={`w-full aspect-square rounded-full border-2 transition-all ${
                  selectedColor.name === c.name ? 'border-white scale-110 shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'border-zinc-800'
                }`}
                style={{ backgroundColor: c.hex }}
                title={c.name}
              />
            ))}
          </div>
          <div className="mt-2 text-center text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{selectedColor.name}</div>
        </section>

        <section>
          <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-3 block">Performance Mapping</label>
          <div className="grid grid-cols-3 gap-2">
            {PERFORMANCE_TIERS.map((tier) => (
              <button
                key={tier}
                onClick={() => setPerformance(tier)}
                className={`py-2 px-1 rounded-lg text-[10px] font-black uppercase transition-all tracking-tighter ${
                  performance === tier ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700'
                }`}
              >
                {tier}
              </button>
            ))}
          </div>
        </section>

        <section className="bg-gradient-to-br from-zinc-800 to-zinc-900 p-5 rounded-2xl border border-zinc-700/50 shadow-inner">
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center">
              <Gauge className="w-4 h-4 mx-auto mb-1 text-zinc-500" />
              <div className="text-lg font-orbitron leading-none">{currentCar.baseSpecs.topSpeed}</div>
              <div className="text-[8px] text-zinc-500 uppercase mt-1">KM/H</div>
            </div>
            <div className="text-center border-x border-zinc-700">
              <Zap className="w-4 h-4 mx-auto mb-1 text-zinc-500" />
              <div className="text-lg font-orbitron leading-none">{currentCar.baseSpecs.acceleration}</div>
              <div className="text-[8px] text-zinc-500 uppercase mt-1">SEC</div>
            </div>
            <div className="text-center">
              <Shield className="w-4 h-4 mx-auto mb-1 text-zinc-500" />
              <div className="text-lg font-orbitron leading-none">{currentCar.baseSpecs.horsepower}</div>
              <div className="text-[8px] text-zinc-500 uppercase mt-1">HP</div>
            </div>
          </div>
        </section>

        <button
          disabled={loading}
          onClick={handleFinalize}
          className="mt-auto w-full py-4 bg-red-600 text-white font-orbitron font-black text-lg hover:bg-red-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase italic tracking-tighter"
        >
          {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : 'Confirm Order'}
        </button>
      </div>

      <div className="flex-1 relative flex flex-col">
        <div className="flex-1 relative overflow-hidden flex items-center justify-center p-8 lg:p-16">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_0%,transparent_70%)]"></div>
          
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[160px] opacity-20 transition-all duration-1000"
            style={{ backgroundColor: selectedColor.hex }}
          ></div>

          <div className="relative z-10 w-full max-w-5xl transform perspective-1000">
            {/* Using a pseudo-tint layer over the image */}
            <div className="relative group">
              <img
                src={currentCar.baseImage}
                alt={currentCar.name}
                className="w-full h-auto object-cover rounded-2xl shadow-[0_40px_100px_-20px_rgba(0,0,0,0.9)] grayscale-[0.2] contrast-[1.1]"
              />
              {/* This layer applies a subtle color overlay to simulate the chosen color */}
              <div 
                className="absolute inset-0 rounded-2xl mix-blend-color opacity-40 pointer-events-none transition-colors duration-1000"
                style={{ backgroundColor: selectedColor.hex }}
              ></div>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/40 via-transparent to-white/10 pointer-events-none"></div>
            </div>
          </div>
          
          <div className="absolute bottom-8 right-8 text-right hidden lg:block">
            <div className="text-white/20 font-orbitron text-7xl font-black italic select-none">
              {currentCar.brand.toUpperCase()}
            </div>
          </div>
        </div>

        <div className="h-1/3 bg-zinc-950 border-t border-zinc-800 p-8 overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-zinc-600">
              <div className="w-12 h-1 bg-zinc-800 overflow-hidden">
                <div className="h-full bg-red-600 animate-[loading_1.5s_infinite]"></div>
              </div>
              <span className="font-orbitron text-[10px] uppercase tracking-[0.3em]">Syncing Factory Data</span>
            </div>
          ) : aiSpecs ? (
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-red-500">
                  <Info className="w-3 h-3" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Model Intelligence</span>
                </div>
                <p className="text-zinc-400 text-sm leading-relaxed font-light">{aiSpecs.description}</p>
                <div className="p-4 bg-zinc-900/80 rounded-xl border border-white/5">
                   <p className="text-[11px] text-zinc-500 italic">"{aiSpecs.funFact}"</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Power Unit', value: aiSpecs.technicalDetails.engine },
                  { label: 'Transmission', value: aiSpecs.technicalDetails.drivetrain },
                  { label: 'Mass Index', value: aiSpecs.technicalDetails.weight },
                  { label: 'Aero Coefficient', value: aiSpecs.technicalDetails.aerodynamics }
                ].map((stat, i) => (
                  <div key={i} className="p-4 bg-zinc-900 border border-white/5 rounded-xl hover:border-red-500/30 transition-colors">
                    <span className="text-[8px] text-zinc-500 uppercase font-black tracking-widest block mb-1">{stat.label}</span>
                    <p className="text-xs text-zinc-200 line-clamp-3 leading-snug">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default Configurator;
