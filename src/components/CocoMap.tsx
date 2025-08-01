import React, { useState, useCallback, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { LatLng, Icon } from 'leaflet';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import 'leaflet/dist/leaflet.css';

interface Coconut {
  id: string;
  lat: number;
  lng: number;
  caption: string;
  isAI: boolean;
  confidence?: number;
}

interface CocoMapProps {
  onInteraction: () => void;
  interactionCount: number;
}

// Kozhikode coordinates
const KOZHIKODE_CENTER: [number, number] = [11.2588, 75.7804];

// Custom coconut icon using DivIcon instead of btoa
const coconutIcon = new Icon({
  iconUrl: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
      <circle cx="16" cy="16" r="15" fill="#8B4513" stroke="#654321" stroke-width="2"/>
      <circle cx="16" cy="16" r="12" fill="#A0522D"/>
      <circle cx="12" cy="12" r="2" fill="#654321"/>
      <circle cx="20" cy="12" r="2" fill="#654321"/>
      <circle cx="16" cy="18" r="1" fill="#654321"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

// Map click handler component
const MapClickHandler: React.FC<{
  isPlacementMode: boolean;
  onMapClick: (latlng: LatLng) => void;
  onInteraction: () => void;
}> = ({ isPlacementMode, onMapClick, onInteraction }) => {
  useMapEvents({
    click: (e) => {
      onInteraction();
      if (isPlacementMode) {
        onMapClick(e.latlng);
      }
    },
  });
  return null;
};

const CocoMap: React.FC<CocoMapProps> = ({ onInteraction, interactionCount }) => {
  const [coconuts, setCoconuts] = useState<Coconut[]>([]);
  const [isPlacementMode, setIsPlacementMode] = useState(false);
  const [showCaptionInput, setShowCaptionInput] = useState(false);
  const [pendingCoconut, setPendingCoconut] = useState<{ lat: number; lng: number } | null>(null);
  const [caption, setCaption] = useState('');
  const { toast } = useToast();

  // Generate initial AI coconuts around Kozhikode
  useEffect(() => {
    const aiCoconuts: Coconut[] = [
      { id: 'ai-1', lat: 11.2488, lng: 75.7704, caption: 'Premium coconut water here!', isAI: true, confidence: 87 },
      { id: 'ai-2', lat: 11.2688, lng: 75.7904, caption: 'Mystical coconut grove', isAI: true, confidence: 73 },
      { id: 'ai-3', lat: 11.2388, lng: 75.7604, caption: 'Organic coconut paradise', isAI: true, confidence: 92 },
      { id: 'ai-4', lat: 11.2788, lng: 75.8004, caption: 'Secret coconut stash', isAI: true, confidence: 56 },
    ];
    setCoconuts(aiCoconuts);
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

  const handleMapClick = (latlng: LatLng) => {
    if (!isPlacementMode) {
      showRoast(roasts.illegalClick);
      return;
    }

    // Check if clicking in ocean (far from Kozhikode coast)
    if (latlng.lat > 11.3 || latlng.lng < 75.7) {
      showRoast(roasts.oceanCoconut);
    }

    setPendingCoconut({ lat: latlng.lat, lng: latlng.lng });
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
      lat: pendingCoconut.lat,
      lng: pendingCoconut.lng,
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
      {/* Map Area */}
      <div className="w-full h-96 border-2 border-accent/30 rounded-lg overflow-hidden shadow-tropical relative">
        <MapContainer
          center={KOZHIKODE_CENTER}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          className={isPlacementMode ? 'cursor-crosshair' : ''}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          <MapClickHandler
            isPlacementMode={isPlacementMode}
            onMapClick={handleMapClick}
            onInteraction={onInteraction}
          />

          {/* Existing Coconuts */}
          {coconuts.map((coconut) => (
            <Marker
              key={coconut.id}
              position={[coconut.lat, coconut.lng]}
              icon={coconutIcon}
              eventHandlers={{
                click: () => handleCoconutClick(coconut),
              }}
            >
              <Popup>
                <div className="text-center">
                  <div className="font-semibold">{coconut.caption}</div>
                  {coconut.isAI && (
                    <div className="text-sm text-muted-foreground mt-1">
                      AI Prediction - {coconut.confidence}% confidence
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Pending Coconut */}
          {pendingCoconut && (
            <Marker
              position={[pendingCoconut.lat, pendingCoconut.lng]}
              icon={coconutIcon}
            >
              <Popup>Placing coconut...</Popup>
            </Marker>
          )}
        </MapContainer>

        {/* Placement Mode Tooltip */}
        {isPlacementMode && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-card text-card-foreground px-4 py-2 rounded-lg shadow-glow z-[1000] border border-accent/30">
            🥥 Choose your sacred coconut spot
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