import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import CocoMap from '@/components/CocoMap';
import CocoBreak from '@/components/CocoBreak';

const Index = () => {
  const [interactionCount, setInteractionCount] = useState(0);
  const [showCocoBreak, setShowCocoBreak] = useState(false);
  const [idleTime, setIdleTime] = useState(0);
  const { toast } = useToast();

  const handleInteraction = useCallback(() => {
    setInteractionCount(prev => prev + 1);
    setIdleTime(0);
  }, []);

  const handleCocoBreakComplete = () => {
    setShowCocoBreak(false);
  };

  // Idle time tracking for roasts
  useEffect(() => {
    const interval = setInterval(() => {
      setIdleTime(prev => prev + 1);
      
      // Show idle roast after 30 seconds of no interaction
      if (idleTime === 30) {
        toast({
          title: "🥥 CocoWhere™ Roast",
          description: "Still here? Even coconuts get bored.",
          duration: 3000,
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [idleTime, toast]);

  // Zoom roast (simulate on scroll)
  useEffect(() => {
    const handleWheel = () => {
      if (Math.random() < 0.3) { // 30% chance to roast on zoom
        toast({
          title: "🥥 CocoWhere™ Roast",
          description: "Zoom all you want. It's still just coconuts.",
          duration: 2500,
        });
      }
      handleInteraction();
    };

    window.addEventListener('wheel', handleWheel);
    return () => window.removeEventListener('wheel', handleWheel);
  }, [handleInteraction, toast]);

  return (
    <div className="min-h-screen bg-gradient-tropical p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <Card className="p-6 mb-6 shadow-tropical border border-accent/30 bg-card/95 backdrop-blur-sm">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-primary mb-2 animate-wave">
              🥥 CocoWhere™
            </h1>
            <p className="text-muted-foreground text-lg italic">
              "A totally unreliable, possibly mystical coconut locator"
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Don't blame us if the ilaneer isn't there — it might be sipping its own water elsewhere.
            </p>
          </div>
        </Card>

        {/* Stats */}
        <Card className="p-4 mb-6 shadow-coconut border border-primary/20 bg-card/95 backdrop-blur-sm">
          <div className="flex justify-between items-center text-sm">
            <div className="text-muted-foreground">
              Interactions: <span className="font-semibold text-primary">{interactionCount}</span>
            </div>
            <div className="text-muted-foreground">
              Coconuts Found: <span className="font-semibold text-accent">0</span> (as expected)
            </div>
            <div className="text-muted-foreground">
              Reliability: <span className="font-semibold text-destructive">-3%</span>
            </div>
          </div>
        </Card>

        {/* Map */}
        <Card className="p-6 shadow-tropical border border-accent/30 bg-card/95 backdrop-blur-sm">
          <CocoMap 
            onInteraction={handleInteraction}
            interactionCount={interactionCount}
          />
        </Card>

        {/* CocoBreak Button */}
        <div className="text-center mt-6">
          <Button
            variant="coconut"
            size="lg"
            onClick={() => setShowCocoBreak(true)}
            className="shadow-glow"
          >
            🥥 Take a CocoBreak!
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-muted-foreground text-sm">
          <p>© 2024 CocoWhere™ - Disappointment Guaranteed</p>
          <p className="mt-1">
            🌴 Powered by wishful thinking and expired coconut water 🌴
          </p>
        </div>
      </div>

      {/* CocoBreak Modal */}
      {showCocoBreak && (
        <CocoBreak onComplete={handleCocoBreakComplete} />
      )}
    </div>
  );
};

export default Index;