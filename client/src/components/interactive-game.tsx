import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";

interface Leaf {
  id: number;
  x: number;
  y: number;
  collected: boolean;
}

export default function InteractiveGame() {
  const [gameActive, setGameActive] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [leaves, setLeaves] = useState<Leaf[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const gameTimerRef = useRef<NodeJS.Timeout>();
  const spawnTimerRef = useRef<NodeJS.Timeout>();
  const leafIdRef = useRef(0);

  const gameLength = 30000; // 30 seconds

  const spawnLeaf = useCallback(() => {
    if (!gameActive) return;

    const newLeaf: Leaf = {
      id: leafIdRef.current++,
      x: Math.random() * 250, // Adjust for container width
      y: Math.random() * 250, // Adjust for container height
      collected: false,
    };

    setLeaves(prev => [...prev, newLeaf]);

    // Remove leaf after 3 seconds if not clicked
    setTimeout(() => {
      setLeaves(prev => prev.filter(leaf => leaf.id !== newLeaf.id));
    }, 3000);

    // Schedule next leaf spawn
    const nextSpawnTime = Math.random() * 1500 + 500; // 0.5-2 seconds
    spawnTimerRef.current = setTimeout(spawnLeaf, nextSpawnTime);
  }, [gameActive]);

  const startGame = () => {
    setGameActive(true);
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setLeaves([]);

    // Start spawning leaves
    spawnLeaf();

    // Set game timer
    gameTimerRef.current = setTimeout(() => {
      endGame();
    }, gameLength);
  };

  const endGame = () => {
    setGameActive(false);
    setGameOver(true);
    if (spawnTimerRef.current) {
      clearTimeout(spawnTimerRef.current);
    }
    setLeaves([]);
  };

  const resetGame = () => {
    setGameActive(false);
    setGameStarted(false);
    setGameOver(false);
    setScore(0);
    setLeaves([]);
    
    if (gameTimerRef.current) {
      clearTimeout(gameTimerRef.current);
    }
    if (spawnTimerRef.current) {
      clearTimeout(spawnTimerRef.current);
    }
  };

  const collectLeaf = (leafId: number) => {
    if (!gameActive) return;

    setLeaves(prev => 
      prev.map(leaf => 
        leaf.id === leafId ? { ...leaf, collected: true } : leaf
      )
    );

    setScore(prev => prev + 10);

    // Remove collected leaf after animation
    setTimeout(() => {
      setLeaves(prev => prev.filter(leaf => leaf.id !== leafId));
    }, 500);
  };

  useEffect(() => {
    return () => {
      if (gameTimerRef.current) {
        clearTimeout(gameTimerRef.current);
      }
      if (spawnTimerRef.current) {
        clearTimeout(spawnTimerRef.current);
      }
    };
  }, []);

  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-primary mb-8" data-testid="game-title">
          Test Your Reflexes
        </h2>
        <p className="text-muted-foreground text-lg mb-12" data-testid="game-description">
          Click the floating leaves before they disappear. How many can you collect?
        </p>
        
        {/* Game Area */}
        <div className="bg-card border border-border rounded-2xl p-8 relative overflow-hidden mx-auto" style={{ height: '400px', maxWidth: '600px' }}>
          {/* Game Stats */}
          {gameStarted && (
            <div className="absolute top-4 left-4 z-20">
              <div className="bg-muted rounded-lg px-4 py-2">
                <span className="text-primary font-bold text-xl" data-testid="game-score">Score: {score}</span>
              </div>
            </div>
          )}
          
          {/* Game Instructions */}
          {!gameStarted && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="text-center">
                <p className="text-muted-foreground mb-4" data-testid="game-instructions">Click the leaves as they appear!</p>
                <Button 
                  onClick={startGame} 
                  className="bg-primary text-primary-foreground px-8 py-4 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                  data-testid="button-start-game"
                >
                  Start Game
                </Button>
              </div>
            </div>
          )}
          
          {/* Game Area */}
          {gameStarted && !gameOver && (
            <div className="absolute inset-0" data-testid="game-area">
              {leaves.map(leaf => (
                <div
                  key={leaf.id}
                  className={`game-leaf absolute w-12 h-12 cursor-pointer transition-all duration-300 hover:scale-110 hover:rotate-6 ${
                    leaf.collected ? 'collected' : ''
                  }`}
                  style={{ 
                    left: `${leaf.x}px`, 
                    top: `${leaf.y}px`,
                    transform: leaf.collected ? 'scale(0) rotate(180deg)' : 'scale(1) rotate(0deg)',
                    opacity: leaf.collected ? 0 : 1,
                  }}
                  onClick={() => collectLeaf(leaf.id)}
                  data-testid={`game-leaf-${leaf.id}`}
                >
                  <img 
                    src="https://images.unsplash.com/photo-1601049676869-702ea24cfd58?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100" 
                    alt="Cannabis leaf" 
                    className="w-full h-full object-contain filter brightness-0 saturate-100" 
                    style={{ filter: 'invert(48%) sepia(79%) saturate(394%) hue-rotate(85deg) brightness(118%) contrast(119%)' }}
                  />
                </div>
              ))}
            </div>
          )}
          
          {/* Game Over Screen */}
          {gameOver && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-primary mb-4" data-testid="game-over-title">Game Over!</h3>
                <p className="text-muted-foreground mb-4">
                  Final Score: <span className="text-primary font-bold" data-testid="final-score">{score}</span>
                </p>
                <Button 
                  onClick={resetGame} 
                  className="bg-primary text-primary-foreground px-8 py-4 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                  data-testid="button-play-again"
                >
                  Play Again
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
