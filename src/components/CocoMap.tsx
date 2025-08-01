import React, { useState, useCallback, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, Tooltip, CircleMarker } from 'react-leaflet';
import L, { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"; // <-- Added Dialog imports

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

const KOZHIKODE_CENTER: LatLngExpression = [11.2588, 75.7804];
const OCEAN_LONGITUDE_THRESHOLD = 75.6; // approx: anything west of this is Arabian Sea for roast purposes

// Custom emoji icon factory
const createCoconutIcon = (isAI: boolean) => {
  return L.divIcon({
    className: 'coconut-emoji-icon',
    html: `<div style="font-size:1.5rem; ${isAI ? 'opacity:0.8;' : ''}">🥥</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -10],
  });
};

const CocoMap: React.FC<CocoMapProps> = ({ onInteraction, interactionCount }) => {
  const [coconuts, setCoconuts] = useState<Coconut[]>([]);
  const [isPlacementMode, setIsPlacementMode] = useState(false);
  const [showCaptionInput, setShowCaptionInput] = useState(false);
  const [pendingCoconut, setPendingCoconut] = useState<{ lat: number; lng: number } | null>(null);
  const [caption, setCaption] = useState('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const { toast } = useToast();
  const mapRef = useRef<any>(null);

  const roasts = {
    welcome: "Welcome, coconut hunter. This map is about as reliable as your New Year resolutions.",
    zoom: "Zoom all you want. It's still just coconuts.",
    idle: "Still here? Even coconuts get bored.",
    illegalClick: "Hey rookie! You cant just drop coconuts anywhere. Use the Add Coconut button like everyone else.",
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

  // Initial AI coconuts with small offsets around Kozhikode
  useEffect(() => {
    const aiCoconuts: Coconut[] = [
 
  {
    id: 'mananchira',
    lat: 11.254423,
    lng: 75.779844,
    caption: 'Royal coconut reigning over Mananchira Square 👑🥥',
    isAI: true,
    confidence: 80,
  },
  {
    id: 'new-bus',
    lat: 11.258978,
    lng: 75.780526,
    caption: 'Traveling coconut waiting at New Bus Stand 🚌🥥',
    isAI: true,
    confidence: 78,
  },
  {
    id: 'palayam',
    lat: 11.255936,
    lng: 75.786971,
    caption: 'Market gossip coconut at Palayam Bazaar 🛍️🥥',
    isAI: true,
    confidence: 82,
  },
  {
    id: 'beach-road',
    lat: 11.258319,
    lng: 75.772614,
    caption: 'Wind-in-its-husk coconut cruising Beach Road 🌬️🥥',
    isAI: true,
    confidence: 79,
  },
  {
    id: 'thondayad',
    lat: 11.274214,
    lng: 75.806985,
    caption: 'Traffic signal coconut stuck at Thondayad Junction 🚦🥥',
    isAI: true,
    confidence: 77,
  },
  {
    id: 'civil-station',
    lat: 11.280152,
    lng: 75.813149,
    caption: 'Paperwork coconut waiting at Civil Station 📄🥥',
    isAI: true,
    confidence: 81,
  },
];
    setCoconuts(aiCoconuts);
  }, []);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(loc);
          if (mapRef.current) {
            mapRef.current.setView([loc.lat, loc.lng]);
          }
          if (Math.abs(position.coords.latitude - 11.2588) > 1) {
            showRoast("Not in Kozhikode? This map is optimized for coconut hunting in God's Own Country!");
          }
        },
        () => {
          setUserLocation({ lat: 11.2588, lng: 75.7804 });
        }
      );
    }
  }, [showRoast]);

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

  const handleCoconutClick = (coconut: Coconut) => {
    onInteraction();
    if (coconut.isAI && coconut.confidence) {
      showRoast(roasts.aiConfidence(coconut.confidence));
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

  // Map click handler component
  const ClickHandler: React.FC = () => {
    useMapEvents({
      click(e) {
        onInteraction();
        if (!isPlacementMode) {
          showRoast(roasts.illegalClick);
          return;
        }
        const { lat, lng } = e.latlng;
        if (lng < OCEAN_LONGITUDE_THRESHOLD) {
          showRoast(roasts.oceanCoconut);
        }
        setPendingCoconut({ lat, lng });
        setShowCaptionInput(true);
        setIsPlacementMode(false);
        document.body.style.cursor = 'auto';
      },
      zoomend() {
        showRoast(roasts.zoom);
      }
    });
    return null;
  };

  return (
    <div className="w-full h-full relative">
      <div className="w-full h-96 rounded-lg overflow-hidden shadow-tropical border-2 border-accent/30">
        <MapContainer
          center={KOZHIKODE_CENTER}
          zoom={12}
          style={{ width: '100%', height: '100%' }}
          whenReady={(map) => {
            mapRef.current = map;
          }}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler />

          {userLocation && (
            <CircleMarker
              center={[userLocation.lat, userLocation.lng]}
              radius={8}
              pathOptions={{ weight: 2 }}
            >
              <Tooltip direction="top" offset={[0, -10]} permanent>
                You (approx)
              </Tooltip>
            </CircleMarker>
          )}

          {coconuts.map(coconut => (
            <Marker
              key={coconut.id}
              position={[coconut.lat, coconut.lng]}
              icon={createCoconutIcon(coconut.isAI)}
              eventHandlers={{
                click: () => handleCoconutClick(coconut)
              }}
            >
              <Tooltip direction="top" offset={[0, -10]} sticky>
                <div className="flex flex-col">
                  <div className="font-medium">{coconut.caption}</div>
                  {coconut.isAI && (
                    <div className="text-xs">{coconut.confidence}% confidence</div>
                  )}
                </div>
              </Tooltip>
            </Marker>
          ))}

          {pendingCoconut && (
            <Marker
              position={[pendingCoconut.lat, pendingCoconut.lng]}
              icon={L.divIcon({
                className: 'animate-pulse',
                html: `<div style="font-size:1.5rem;">🥥</div>`,
                iconSize: [30, 30],
                iconAnchor: [15, 15],
              })}
            />
          )}
        </MapContainer>
      </div>

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
          <Button variant="outline" onClick={handleCancelPlacement}>
            Cancel
          </Button>
        )}
      </div>

      {/* Caption Input Modal using Dialog Component (Blur effect is removed here) */}
      <Dialog open={showCaptionInput} onOpenChange={(isOpen) => !isOpen && handleCancelPlacement()}>
        <DialogContent className="sm:max-w-[425px] bg-background border-accent/30 shadow-glow">
          <DialogHeader>
            <DialogTitle className="text-center text-lg">🥥 Name Your Discovery</DialogTitle>
            <DialogDescription className="text-center">
              Every great coconut deserves a name. Don't be shy.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Input
                id="caption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="e.g., 'The juiciest find on Beach Road'"
                className="col-span-3"
                maxLength={100}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSubmitCaption();
                  }
                }}
              />
              <div className="text-right text-xs text-muted-foreground pr-1">
                {caption.length} / 100
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelPlacement}>
              Cancel
            </Button>
            <Button variant="coconut" onClick={handleSubmitCaption}>
              Plant Coconut
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CocoMap;