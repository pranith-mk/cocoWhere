import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import 'leaflet/dist/leaflet.css';
import './leaflet-icons';

createRoot(document.getElementById("root")!).render(<App />);
