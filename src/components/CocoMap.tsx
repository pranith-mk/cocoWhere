import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface Coconut {
  id: string;
  x: number;
  y: number;
  caption: string;
  isAI: boolean;
  confidence?: number;
}

interface CocoMapProps {
  onInteraction: () => void;
  interactionCount: number;
}

const CocoMap: React.FC<CocoMapProps> = ({ onInteraction, interactionCount }) => {
  const [coconuts, setCoconuts] = useState<Coconut[]>([]);
  const [isPlacementMode, setIsPlacementMode] = useState(false);
  const [showCaptionInput, setShowCaptionInput] = useState(false);
  const [pendingCoconut, setPendingCoconut] = useState<{ x: number; y: number } | null>(null);
  const [caption, setCaption] = useState('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Generate initial AI coconuts around Kozhikode (using percentage coordinates)
  useEffect(() => {
    const aiCoconuts: Coconut[] = [
      { id: 'ai-1', x: 25, y: 30, caption: 'Premium coconut water near Kozhikode Beach!', isAI: true, confidence: 87 },
      { id: 'ai-2', x: 70, y: 45, caption: 'Mystical coconut grove in Wayanad', isAI: true, confidence: 73 },
      { id: 'ai-3', x: 45, y: 70, caption: 'Organic coconut paradise in Malabar', isAI: true, confidence: 92 },
      { id: 'ai-4', x: 80, y: 20, caption: 'Secret coconut stash near Kappad', isAI: true, confidence: 56 },
    ];
    setCoconuts(aiCoconuts);
  }, []);

  // Get user location for Kozhikode focus
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          // Show location-based roast
          if (Math.abs(position.coords.latitude - 11.2588) > 1) {
            showRoast("Not in Kozhikode? This map is optimized for coconut hunting in God's Own Country!");
          }
        },
        () => {
          // Default to Kozhikode coordinates
          setUserLocation({ lat: 11.2588, lng: 75.7804 });
        }
      );
    }
  }, []);

  const roasts = {
    welcome: "Welcome, coconut hunter. This map is about as reliable as your New Year resolutions.",
    zoom: "Zoom all you want. It's still just coconuts.",
    idle: "Still here? Even coconuts get bored.",
    illegalClick: "Illegal coconut drop detected. Use the sacred Add Coconut button, rookie.",
    oceanCoconut: "Ocean coconut? Bold move, sailor.",
    speechless: "Speechless? Even your coconut is disappointed.",
    triggerHappy: "Trigger-happy much? Even coconuts need commitment.",
    cancelled: "Scared of responsibility? Coconut unplaced.",
    aiConfidence: (confidence: number) => `AI says ${confidence}% chance of coconut here. 100% chance you'll never drink it.`
  };

  const showRoast = useCallback((message: string) => {
    toast({
      title: "🥥 CocoWhere™ Roast",
      description: message,
      duration: 3000,
    });
  }, [toast]);

  useEffect(() => {
    if (interactionCount === 0) {
      setTimeout(() => showRoast(roasts.welcome), 1000);
    }
  }, [interactionCount, showRoast]);

  const handleAddCoconut = () => {
    onInteraction();
    if (isPlacementMode) {
      showRoast(roasts.triggerHappy);
      return;
    }
    setIsPlacementMode(true);
    document.body.style.cursor = 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'32\' height=\'32\' viewport=\'0 0 100 100\' style=\'fill:black;font-size:24px;\'><text y=\'50%\'>🥥</text></svg>") 16 16, auto';
  };

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    onInteraction();
    
    if (!isPlacementMode) {
      showRoast(roasts.illegalClick);
      return;
    }

    if (!mapRef.current) return;

    const rect = mapRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Check if clicking in ocean (top area representing Arabian Sea)
    if (y < 20) {
      showRoast(roasts.oceanCoconut);
    }

    setPendingCoconut({ x, y });
    setShowCaptionInput(true);
    setIsPlacementMode(false);
    document.body.style.cursor = 'auto';
  };

  const handleCoconutClick = (coconut: Coconut) => {
    onInteraction();
    if (coconut.isAI) {
      showRoast(roasts.aiConfidence(coconut.confidence || 0));
    }
  };

  const handleSubmitCaption = () => {
    onInteraction();
    
    if (!pendingCoconut) return;
    
    if (caption.trim() === '') {
      showRoast(roasts.speechless);
      return;
    }

    const newCoconut: Coconut = {
      id: `user-${Date.now()}`,
      x: pendingCoconut.x,
      y: pendingCoconut.y,
      caption: caption.trim(),
      isAI: false
    };

    setCoconuts(prev => [...prev, newCoconut]);
    setShowCaptionInput(false);
    setPendingCoconut(null);
    setCaption('');
  };

  const handleCancelPlacement = () => {
    onInteraction();
    setIsPlacementMode(false);
    setShowCaptionInput(false);
    setPendingCoconut(null);
    setCaption('');
    document.body.style.cursor = 'auto';
    showRoast(roasts.cancelled);
  };

  return (
    <div className="w-full h-full relative">
      {/* Map Area - Stylized as Kozhikode region */}
      <div
        ref={mapRef}
        className={`w-full h-96 bg-gradient-kozhikode border-2 border-accent/30 rounded-lg relative overflow-hidden shadow-tropical ${
          isPlacementMode ? 'cursor-crosshair' : 'cursor-pointer'
        }`}
        onClick={handleMapClick}
      >
        {/* Background representing Kozhikode geography */}
        <div className="absolute inset-0">
          {/* Arabian Sea (top) */}
          <div className="absolute top-0 left-0 w-full h-1/4 bg-gradient-to-b from-blue-400/40 to-blue-300/20"></div>
          {/* Coastal area */}
          <div className="absolute top-1/4 left-0 w-full h-1/4 bg-gradient-to-b from-yellow-200/30 to-green-200/20"></div>
          {/* Inland areas */}
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-green-400/30 to-green-200/20"></div>
          {/* Location indicator */}
          {userLocation && (
            <div className="absolute top-4 right-4 bg-card text-card-foreground px-2 py-1 rounded text-xs border border-accent/30">
              📍 Kozhikode Region
            </div>
          )}
        </div>

        {/* Placement Mode Tooltip */}
        {isPlacementMode && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-card text-card-foreground px-4 py-2 rounded-lg shadow-glow z-10 border border-accent/30">
            🥥 Choose your sacred coconut spot in Kozhikode
          </div>
        )}

        {/* Coconut Markers */}
        {coconuts.map((coconut) => (
          <div
            key={coconut.id}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 ${
              coconut.isAI ? 'animate-coconut-bounce' : ''
            }`}
            style={{ left: `${coconut.x}%`, top: `${coconut.y}%` }}
            onClick={(e) => {
              e.stopPropagation();
              handleCoconutClick(coconut);
            }}
          >
            <div className="relative group">
              <div className={`text-2xl ${coconut.isAI ? 'opacity-80' : ''} hover:scale-110 transition-transform`}>
                🥥
              </div>
              {coconut.isAI && (
                <div className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs px-1 rounded-full">
                  AI
                </div>
              )}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-card text-card-foreground px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity border border-accent/30 shadow-lg">
                {coconut.caption}
                {coconut.isAI && (
                  <div className="text-muted-foreground">{coconut.confidence}% confidence</div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Pending Coconut */}
        {pendingCoconut && (
          <div
            className="absolute transform -translate-x-1/2 -translate-y-1/2 text-2xl animate-pulse z-10"
            style={{ left: `${pendingCoconut.x}%`, top: `${pendingCoconut.y}%` }}
          >
            🥥
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="mt-4 flex justify-center">
        <Button
          variant="coconut"
          size="coconut"
          onClick={handleAddCoconut}
          className="mr-4"
        >
          🥥 Add Coconut
        </Button>
        
        {isPlacementMode && (
          <Button
            variant="outline"
            onClick={handleCancelPlacement}
          >
            Cancel
          </Button>
        )}
      </div>

      {/* Caption Input Modal */}
      {showCaptionInput && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="p-6 max-w-md w-full mx-4 shadow-glow border border-accent/30">
            <h3 className="text-lg font-semibold mb-4 text-center">Name Your Coconut</h3>
            <Input
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Describe this magnificent coconut..."
              className="mb-4"
              autoFocus
              onKeyPress={(e) => e.key === 'Enter' && handleSubmitCaption()}
            />
            <div className="flex gap-2">
              <Button 
                variant="coconut" 
                onClick={handleSubmitCaption}
                className="flex-1"
              >
                Plant Coconut
              </Button>
              <Button 
                variant="outline" 
                onClick={handleCancelPlacement}
              >
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CocoMap;