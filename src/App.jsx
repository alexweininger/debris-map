import './App.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet';
import React, { useState, useCallback, useContext } from 'react';
import { uniq } from 'lodash';
import { Form } from 'react-bootstrap';
import { useDropzone } from 'react-dropzone'
const jsonData = require('./data/1.json');

function MyDropzone() {
    const ctx = useContext(dataContext);
    const onDrop = useCallback(acceptedFiles => {
        // Do something with the files
        acceptedFiles.forEach((file) => {
            const reader = new FileReader();
            reader.onload = () => {
                const text = reader.result;
                // do whatever you want with the file contents
                console.log(text);
                ctx.setData(JSON.parse(text));
            };
            reader.onabort = () => console.log('file reading was aborted');
            reader.onerror = () => console.log('file reading has failed');

            reader.readAsText(file);
        })
    }, [])
    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

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

function SliderControl({ data, setTypeFilter }) {
    let types = [];

    const [checked, setChecked] = useState([]);

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
                            onChange={(e) => {
                                if (checked.includes(type)) {
                                    setChecked(checked.filter((val) => val !== type));
                                    setTypeFilter(checked.filter((val) => val !== type));
                                } else {
                                    setChecked([...checked, type]);
                                    setTypeFilter([...checked, type]);
                                }
                            }}
                        />
                    )
                })}
            </div>
        </Form>
    );
}

const dataContext = React.createContext({
    data: undefined,
    setData: undefined
});

function App() {

    L.Icon.Default.imagePath = "images/"

    const [filter, setFilter] = useState([]);

    const [data, setData] = useState({});

    const context = {
        data,
        setData
    }

    return (
        <div className="App">

            <dataContext.Provider value={context}>
                <MyDropzone />

                {context.data !== undefined && (
                    <div>

                        <MapContainer center={[45.523064, -122.676483]} zoom={10} scrollWheelZoom={true} style={{ height: '80vh', margin: '0', padding: '0' }}>
                            <TileLayer
                                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            {context.data &&
                                context.data?.map?.((point) => {

                                    const types = point['Type(s)'].replaceAll(' ', '').split(',');
                                    console.log(filter, types);
                                    if (filter.length > 0) {
                                        if (!filter.every((val) => types.includes(val))) {
                                            return;
                                        }
                                    }

                                    const pos = point.Location.split('/');
                                    // const ranPos = [parseFloat(pos[0]) + getRandom(), parseFloat(pos[1]) + getRandom()];
                                    // console.log(pos, ranPos);
                                    return (
                                        <Marker position={pos} key={point.Location + Math.random()}>
                                            <Popup>
                                                {point['Type(s)']}
                                            </Popup>
                                        </Marker>
                                    )
                                })
                            }
                        </MapContainer>
                        <SliderControl data={jsonData} setTypeFilter={setFilter} />
                    </div>
                )}
            </dataContext.Provider>
        </div>
    );
}

export default App;
