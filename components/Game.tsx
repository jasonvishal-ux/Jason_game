
import React, { useEffect, useRef, useState } from 'react';
import { UserConfig, AISpecs, GameState } from '../types';
import { Trophy, FastForward, Timer, ArrowLeft, RefreshCw, XCircle, Zap } from 'lucide-react';

interface Props {
  config: UserConfig;
  specs: AISpecs;
  onExit: () => void;
}

const Game: React.FC<Props> = ({ config, specs, onExit }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [uiState, setUiState] = useState<GameState>({
    score: 0,
    speed: 0,
    distance: 0,
    isGameOver: false,
    isPlaying: false,
    boostLevel: 100,
    isBoosting: false,
  });

  const stateRef = useRef({
    score: 0,
    speed: 0,
    distance: 0,
    isPlaying: false,
    isGameOver: false,
    playerX: 175,
    roadOffset: 0,
    boostLevel: 100,
    isBoosting: false,
    particles: [] as { x: number; y: number; life: number; color: string }[],
    cameraShake: 0,
  });

  const requestRef = useRef<number>(null);
  const obstacles = useRef<{ x: number; y: number; speed: number; color: string; type: string }[]>([]);
  const keys = useRef<{ [key: string]: boolean }>({});

  const laneWidth = 100;
  const numLanes = 4;
  const canvasWidth = numLanes * laneWidth;
  const canvasHeight = 600;

  const spawnObstacle = () => {
    const lane = Math.floor(Math.random() * numLanes);
    const types = ['Sedan', 'SUV', 'Truck'];
    obstacles.current.push({
      x: lane * laneWidth + 25,
      y: -150,
      speed: 2 + Math.random() * 4,
      color: ['#4b5563', '#1e40af', '#15803d', '#b45309', '#3f3f46'][Math.floor(Math.random() * 5)],
      type: types[Math.floor(Math.random() * types.length)],
    });
  };

  const drawCar = (ctx: CanvasRenderingContext2D, x: number, y: number, color: string, isPlayer: boolean) => {
    ctx.save();
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(x + 4, y + 4, 52, 92);

    // Body
    ctx.fillStyle = color;
    const radius = 8;
    ctx.beginPath();
    ctx.roundRect(x, y, 50, 90, radius);
    ctx.fill();

    // Windows
    ctx.fillStyle = '#111';
    ctx.fillRect(x + 5, y + 15, 40, 20); // Front
    ctx.fillRect(x + 5, y + 60, 40, 15); // Rear
    ctx.fillRect(x + 2, y + 25, 3, 30); // Left side
    ctx.fillRect(x + 45, y + 25, 3, 30); // Right side

    if (isPlayer) {
      // Spoiler
      ctx.fillStyle = '#000';
      ctx.fillRect(x + 2, y + 80, 46, 8);
      
      // Racing Stripe
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.fillRect(x + 20, y, 10, 90);

      // Boost Flames
      if (stateRef.current.isBoosting) {
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.moveTo(x + 10, y + 90);
        ctx.lineTo(x + 15, y + 110 + Math.random() * 10);
        ctx.lineTo(x + 20, y + 90);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(x + 30, y + 90);
        ctx.lineTo(x + 35, y + 110 + Math.random() * 10);
        ctx.lineTo(x + 40, y + 90);
        ctx.fill();
      }
    } else {
      // Roof Detail
      ctx.strokeStyle = 'rgba(0,0,0,0.1)';
      ctx.strokeRect(x + 10, y + 35, 30, 20);
    }

    // Lights
    ctx.fillStyle = isPlayer ? '#fef08a' : '#fff'; // Headlights
    ctx.fillRect(x + 5, y + 2, 10, 4);
    ctx.fillRect(x + 35, y + 2, 10, 4);

    ctx.fillStyle = '#ef4444'; // Tail lights
    ctx.fillRect(x + 5, y + 86, 8, 3);
    ctx.fillRect(x + 37, y + 86, 8, 3);

    ctx.restore();
  };

  const drawEnvironment = (ctx: CanvasRenderingContext2D) => {
    // Road
    ctx.fillStyle = '#1c1c1c';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Shoulder/Grass
    ctx.fillStyle = '#064e3b';
    ctx.fillRect(-20, 0, 20, canvasHeight);
    ctx.fillRect(canvasWidth, 0, 20, canvasHeight);

    // Lane Markings
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 2;
    for (let i = 1; i < numLanes; i++) {
      ctx.beginPath();
      ctx.setLineDash([30, 50]);
      ctx.lineDashOffset = -stateRef.current.roadOffset;
      ctx.moveTo(i * laneWidth, 0);
      ctx.lineTo(i * laneWidth, canvasHeight);
      ctx.stroke();
    }
    
    // Side lines
    ctx.setLineDash([]);
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(2, 0); ctx.lineTo(2, canvasHeight);
    ctx.moveTo(canvasWidth - 2, 0); ctx.lineTo(canvasWidth - 2, canvasHeight);
    ctx.stroke();
  };

  const update = () => {
    if (stateRef.current.isGameOver || !stateRef.current.isPlaying) return;

    // Camera Shake Decays
    if (stateRef.current.cameraShake > 0) stateRef.current.cameraShake -= 0.5;

    // Input Handling
    if (keys.current['ArrowLeft'] && stateRef.current.playerX > 10) stateRef.current.playerX -= 8;
    if (keys.current['ArrowRight'] && stateRef.current.playerX < canvasWidth - 60) stateRef.current.playerX += 8;
    
    // Boost Logic
    const wantsBoost = keys.current[' '] && stateRef.current.boostLevel > 0;
    stateRef.current.isBoosting = wantsBoost;
    
    if (wantsBoost) {
      stateRef.current.boostLevel -= 0.8;
      stateRef.current.cameraShake = 2;
    } else if (stateRef.current.boostLevel < 100) {
      stateRef.current.boostLevel += 0.1;
    }

    // Physics
    const baseSpeed = 12 + (stateRef.current.score / 2000);
    const boostMultiplier = stateRef.current.isBoosting ? 2.2 : 1.0;
    const currentSpeed = baseSpeed * boostMultiplier;
    
    stateRef.current.roadOffset = (stateRef.current.roadOffset + currentSpeed) % 80;

    // Obstacles
    if (Math.random() < 0.025 + (stateRef.current.score / 10000)) spawnObstacle();

    const playerRect = { x: stateRef.current.playerX, y: canvasHeight - 120, w: 50, h: 90 };

    obstacles.current = obstacles.current.filter((obs) => {
      obs.y += obs.speed + (currentSpeed * 0.35);

      const obsRect = { x: obs.x, y: obs.y, w: 50, h: 90 };
      
      // Collision
      if (
        playerRect.x < obsRect.x + obsRect.w &&
        playerRect.x + playerRect.w > obsRect.x &&
        playerRect.y < obsRect.y + obsRect.h &&
        playerRect.y + playerRect.h > obsRect.y
      ) {
        stateRef.current.isGameOver = true;
        stateRef.current.isPlaying = false;
        setUiState(prev => ({ ...prev, isGameOver: true, isPlaying: false }));
      }

      // Near Miss (Bonus points)
      const dist = Math.sqrt(Math.pow(playerRect.x - obsRect.x, 2) + Math.pow(playerRect.y - obsRect.y, 2));
      if (dist < 80 && !stateRef.current.isGameOver) {
         stateRef.current.score += 2;
      }

      return obs.y < canvasHeight + 100;
    });

    stateRef.current.score += stateRef.current.isBoosting ? 3 : 1;
    stateRef.current.distance = Math.floor(stateRef.current.score / 10);
    stateRef.current.speed = Math.round(currentSpeed * 12);

    // Particles for speed
    if (stateRef.current.isBoosting || currentSpeed > 15) {
      stateRef.current.particles.push({
        x: Math.random() * canvasWidth,
        y: -10,
        life: 1,
        color: stateRef.current.isBoosting ? '#fb923c' : '#fff'
      });
    }

    stateRef.current.particles = stateRef.current.particles.filter(p => {
      p.y += currentSpeed * 1.5;
      p.life -= 0.05;
      return p.y < canvasHeight && p.life > 0;
    });

    // UI Sync
    if (stateRef.current.score % 4 === 0) {
      setUiState({
        ...stateRef.current,
        isGameOver: stateRef.current.isGameOver,
        isPlaying: stateRef.current.isPlaying,
      } as GameState);
    }

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.save();
        // Shake
        if (stateRef.current.cameraShake > 0) {
          ctx.translate((Math.random() - 0.5) * stateRef.current.cameraShake, (Math.random() - 0.5) * stateRef.current.cameraShake);
        }

        drawEnvironment(ctx);
        
        // Particles
        stateRef.current.particles.forEach(p => {
          ctx.globalAlpha = p.life;
          ctx.fillStyle = p.color;
          ctx.fillRect(p.x, p.y, 2, 20);
        });
        ctx.globalAlpha = 1;

        obstacles.current.forEach(obs => drawCar(ctx, obs.x, obs.y, obs.color, false));
        drawCar(ctx, stateRef.current.playerX, canvasHeight - 120, config.colorHex, true);
        
        ctx.restore();
      }
    }

    requestRef.current = requestAnimationFrame(update);
  };

  const startGame = () => {
    stateRef.current = {
      score: 0,
      speed: 0,
      distance: 0,
      isPlaying: true,
      isGameOver: false,
      playerX: 175,
      roadOffset: 0,
      boostLevel: 100,
      isBoosting: false,
      particles: [],
      cameraShake: 0,
    };
    obstacles.current = [];
    setUiState({
      score: 0,
      speed: 0,
      distance: 0,
      isGameOver: false,
      isPlaying: true,
      boostLevel: 100,
      isBoosting: false,
    });
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    requestRef.current = requestAnimationFrame(update);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        keys.current[e.key] = true;
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault();
    };
    const handleKeyUp = (e: KeyboardEvent) => keys.current[e.key] = false;
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center p-4 overflow-hidden font-orbitron">
      
      {/* HUD Overlay */}
      <div className="w-full max-w-4xl grid grid-cols-3 items-center mb-6 px-4 z-10">
        <button onClick={onExit} className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] uppercase tracking-widest font-black">Garage</span>
        </button>
        
        <div className="flex justify-center gap-10">
          <div className="text-center">
             <div className="text-zinc-600 text-[8px] font-black uppercase tracking-widest mb-1">ODOMETER</div>
             <div className="text-xl font-black italic">{uiState.distance}m</div>
          </div>
          <div className="text-center">
             <div className="text-zinc-600 text-[8px] font-black uppercase tracking-widest mb-1">VELOCITY</div>
             <div className={`text-xl font-black italic transition-colors ${uiState.isBoosting ? 'text-orange-500' : 'text-white'}`}>
                {uiState.speed} <span className="text-[10px] not-italic opacity-50">KM/H</span>
             </div>
          </div>
        </div>

        <div className="text-right">
           <div className="text-zinc-600 text-[8px] font-black uppercase tracking-widest mb-1">SESSION SCORE</div>
           <div className="text-xl font-black italic text-yellow-500">{uiState.score}</div>
        </div>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
          className="bg-zinc-900 rounded-3xl border-8 border-zinc-800 shadow-[0_0_100px_rgba(0,0,0,0.8)]"
        />

        {/* Boost Bar Side HUD */}
        <div className="absolute -right-12 bottom-10 h-64 w-4 bg-zinc-800 rounded-full overflow-hidden flex flex-col justify-end p-0.5 border border-zinc-700">
           <div 
             className="w-full bg-gradient-to-t from-orange-600 to-yellow-400 rounded-full transition-all duration-100"
             style={{ height: `${uiState.boostLevel}%` }}
           />
           <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[8px] font-black text-orange-500">NOS</div>
        </div>

        {!uiState.isPlaying && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center text-center p-10 z-20">
            {uiState.isGameOver ? (
              <div className="animate-in fade-in zoom-in duration-300">
                <div className="w-24 h-24 rounded-full bg-red-600/20 flex items-center justify-center mx-auto mb-6 border border-red-500/50">
                   <XCircle className="w-12 h-12 text-red-600" />
                </div>
                <h2 className="text-6xl font-black italic mb-2 tracking-tighter text-white">FATAL CRASH</h2>
                <p className="text-zinc-500 mb-8 uppercase tracking-widest text-[10px] font-bold">Structural integrity compromised</p>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={startGame}
                    className="flex items-center gap-3 px-10 py-4 bg-white text-black hover:bg-red-600 hover:text-white rounded-full font-black italic transition-all transform hover:scale-105"
                  >
                    <RefreshCw className="w-4 h-4" />
                    RESTART
                  </button>
                  <button
                    onClick={onExit}
                    className="px-10 py-4 bg-zinc-800 text-zinc-400 hover:bg-zinc-700 rounded-full font-black italic transition-all"
                  >
                    GARAGE
                  </button>
                </div>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-6">
                  <span className="text-red-600 font-black text-xs uppercase tracking-[0.4em] block mb-2">Simulation Ready</span>
                  <h1 className="text-5xl font-black italic tracking-tighter text-white">
                    {config.car.brand} {config.car.name}
                  </h1>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-10 max-w-sm mx-auto">
                   <div className="p-4 bg-zinc-900 rounded-2xl border border-white/5">
                      <div className="text-zinc-500 text-[8px] font-black uppercase mb-1">Movement</div>
                      <div className="text-white text-[10px]">ARROW KEYS</div>
                   </div>
                   <div className="p-4 bg-zinc-900 rounded-2xl border border-white/5">
                      <div className="text-zinc-500 text-[8px] font-black uppercase mb-1">Nitrous</div>
                      <div className="text-white text-[10px]">SPACEBAR</div>
                   </div>
                </div>

                <button
                  onClick={startGame}
                  className="group relative px-16 py-6 bg-red-600 text-white font-black text-2xl italic tracking-tighter hover:bg-red-500 transition-all rounded-full overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                  <span className="relative flex items-center gap-4">
                    <FastForward className="w-7 h-7" />
                    ENGAGE DRIVE
                  </span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-10 flex gap-6 text-zinc-600">
         <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
            <span className="text-[9px] font-black uppercase tracking-widest">Hold Space for NOS</span>
         </div>
         <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
            <span className="text-[9px] font-black uppercase tracking-widest">Near misses + Score</span>
         </div>
      </div>

      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default Game;
