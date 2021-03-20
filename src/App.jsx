import './App.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet';
import React, { useState, useCallback } from 'react';
import { uniq } from 'lodash';
import { Form } from 'react-bootstrap';
import {useDropzone} from 'react-dropzone'
const jsonData = require('./data/1.json');

function MyDropzone() {
  const onDrop = useCallback(acceptedFiles => {
    // Do something with the files
    console.log(acceptedFiles);
  }, [])
  const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop})

  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} />
      {
        isDragActive ?
          <p>Drop the files here ...</p> :
          <p>Drag 'n' drop some files here, or click to select files</p>
      }
    </div>
  )
}

function getRandom() {
    return Math.random() * 0.001 * (Math.round(Math.random()) ? 1 : -1)
}

function SliderControl({ data }) {
    let types = [];

    data.forEach((point) => {
        const t = point['Type(s)'].split(', ');
        types.push(...t);
    });

    types = uniq(types);

    return (
        <Form>
            <div className="mb-3">
                {types.map((type) => {
                    return (
                        <Form.Check
                            inline
                            type='checkbox'
                            id={`default-${type}`}
                            label={type}
                        />
                    )
                })}
            </div>
        </Form>
    );
}

function App() {

    L.Icon.Default.imagePath = "images/"

    const [filter, setFilter] = useState();

    return (
        <div className="App">

            <MyDropzone />

            <MapContainer center={[45.523064, -122.676483]} zoom={10} scrollWheelZoom={false} style={{ height: '80vh', margin: '0', padding: '0' }}>
                <TileLayer
                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {
                    jsonData.map((point) => {
                        const pos = point.Location.split('/');
                        const ranPos = [parseFloat(pos[0]) + getRandom(), parseFloat(pos[1]) + getRandom()];
                        console.log(pos, ranPos);
                        return (
                            <Marker position={ranPos} key={point.Location + Math.random()}>
                                <Popup>
                                    {point['Type(s)']}
                                </Popup>
                            </Marker>
                        )
                    })
                }
            </MapContainer>
            <SliderControl data={jsonData} />
        </div>
    );
}

export default App;
