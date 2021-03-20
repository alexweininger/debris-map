import './App.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import markerIconPng from "leaflet/dist/images/marker-icon.png"
import {Icon} from 'leaflet'

function App() {
  return (
    <div className="App">
      <MapContainer center={[51.505, -0.09]} zoom={13} scrollWheelZoom={false}>
        <TileLayer
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[51.505, -0.09]}  icon={new Icon({iconUrl: markerIconPng, iconSize: [25, 41], iconAnchor: [12, 41]})}>
                <Popup>
                A pretty CSS3 popup. <br /> Easily customizable.
                </Popup>
        </Marker>
        </MapContainer>
    </div>
  );
}

export default App;
