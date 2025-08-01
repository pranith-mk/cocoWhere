import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface CocoBreakProps {
  onComplete: () => void;
}

const CocoBreak: React.FC<CocoBreakProps> = ({ onComplete }) => {
  const [clicks, setClicks] = useState(0);
  const [isCracked, setIsCracked] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const { toast } = useToast();

  const maxClicks = 10;

  const handleCoconutClick = () => {
    if (isComplete) return;

    const newClicks = clicks + 1;
    setClicks(newClicks);

    if (newClicks >= maxClicks) {
      setIsCracked(true);
      setTimeout(() => {
        setIsComplete(true);
        toast({
          title: "🥥 Achievement Unlocked",
          description: "Congrats, you broke a coconut. Achievement unlocked: Time Wasted.",
          duration: 5000,
        });
        setTimeout(onComplete, 2000);
      }, 1000);
    }
  };

  const getCurrentCoconut = () => {
    if (isComplete) return "🥥"; // Half coconut after completion
    if (isCracked) return "💥"; // Explosion effect
    return "🥥"; // Full coconut initially

  };

  const getProgressMessage = () => {
    if (isComplete) return "Coconut obliterated! 🎉";
    if (isCracked) return "CRACK! 💥";
    if (clicks >= 7) return "Almost there... keep smashing!";
    if (clicks >= 5) return "It's showing signs of weakness!";
    if (clicks >= 3) return "You're making progress!";
    if (clicks >= 1) return "That coconut felt that!";
    return "Click to smash this coconut!";
  };

  return (
    <div className="fixed inset-0 bg-background/90 backdrop-blur-sm flex items-center justify-center z-50">
      <Card className="p-8 max-w-md w-full mx-4 shadow-glow border border-accent/30 text-center">
        <h2 className="text-2xl font-bold mb-4 text-primary">🥥 CocoBreak!</h2>
        <p className="text-muted-foreground mb-6">
          You've earned a special privilege. Time to release some stress!
        </p>

        <div className="mb-6">
          <div
            className={`text-8xl cursor-pointer select-none ${
              clicks > 0 ? 'animate-crack' : ''
            } hover:scale-110 transition-transform ${
              isCracked ? 'animate-pulse' : ''
            }`}
            onClick={handleCoconutClick}
            style={{
              filter: clicks > 5 ? 'hue-rotate(20deg)' : 'none',
              transform: isCracked ? 'scale(1.2)' : 'scale(1)'
            }}
          >
            {getCurrentCoconut()}
          </div>
        </div>

        <div className="mb-4">
          <div className="w-full bg-muted rounded-full h-3 mb-2">
            <div
              className="bg-gradient-coconut h-3 rounded-full transition-all duration-300 ease-out"
    
              
              style={{ width: `${Math.min((clicks / maxClicks) * 100, 100)}%` }}
            ></div>
          </div>
          <p className="text-sm text-muted-foreground">
            {clicks}/{maxClicks} smashes
          </p>
        </div>

        <p className="text-lg font-medium mb-6 text-accent">
          {getProgressMessage()}
        </p>

        {!isComplete && (
          <div className="space-y-2">
            <Button
              variant="coconut"
              size="lg"
              onClick={handleCoconutClick}
              className="w-full"
            >
              SMASH! 💥
            </Button>
            <p className="text-xs text-muted-foreground">
              Click the coconut or use the button
            </p>
          </div>
        )}

        {isComplete && (
          <div className="animate-bounce">
            <div className="text-4xl mb-2">🏆</div>
            <p className="text-primary font-semibold">Mission Accomplished!</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default CocoBreak;