import './App.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet';
import React, { useCallback } from 'react';
import { uniq } from 'lodash';
import { useDropzone } from 'react-dropzone'
import { Box, ChakraProvider, Flex, Grid } from "@chakra-ui/react"
import { useStore } from './store';
import Select from 'react-select'
import TimeRange from 'react-timeline-range-slider'
import TimeRangeSlider from 'react-time-range-slider';
import MarkerClusterGroup from 'react-leaflet-markercluster';
const parse = require('csv-parse');

function MyDropzone() {
    const setPoints = useStore(state => state.setPoints);
    const onDrop = useCallback(acceptedFiles => {
        // Do something with the files
        acceptedFiles.forEach((file) => {
            const reader = new FileReader();
            reader.onload = () => {
                const text = reader.result;
                const isCsv = file.path.endsWith('.csv');

                if (isCsv) {
                    parse(text, { columns: true }, (err, output) => {
                        setPoints(output);
                    });
                    return;
                } else {
                    alert('Sorry, only .csv files are supported.');
                    return;
                }
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

function getTypes(point) {
    return point['Tags'].replaceAll(' ', '').split(',');
}

function countPointsOfType(points, type) {
    return points.filter((point) => getTypes(point).includes(type)).length;
}

function getDates(point) {
    return new Date(point['Date']).toDateString();
}

function getPointsWithDate(points, date) {
    return points.filter((point) => getDates(point).includes(date)).length;
}
function SliderControl() {

    const state = useStore();

    let types = [];
    let dates = [];
    let brands = ["caprisun", "mcdonalds"];
    let objects = ["aluminumfoil", "bag", "bottlecap", "butt", "can", "candy", "candywrapper", "cigarette", "cigarettebutt",
        "clotheshanger", "cup", "drink", "drinkcarton", "drinkpouch", "facemask", "foil", "fruitsnacks", "hanger", "knife",
        "lighter", "lotteryticket", "medicalfacemask", "packingpeanut", "piece", "plasticbag", "plasticknife", "plastictube",
        "receipt", "rubberband", "sodalid", "sticker", "straw", "wrapper"];
    let materials = ["aluminum", "cardboard", "cloth", "glass", "metal", "paper", "plastic", "styrofoam", "wood"];

    const customStyles = {
        option: (provided, state) => ({
            ...provided,
            fontSize: 12,
            padding: 0,
        }),
        multiValue: (provided, state) => ({
            ...provided,
            fontSize: '12px'
        }),
        placeholder: (provided, state) => ({
            ...provided,
            fontSize: '12px'
        }),
    }

    const points = [];

    if (state.typeFilter.length > 0) {
        state.points.forEach((point) => {
            const t = getTypes(point);
            const b = state.typeFilter.every((ct) => t.includes(ct));
            if (b) {
                points.push(point);
            }
        });
    } else {
        points.push(...state.points);
    }

    points.forEach((point) => {
        const t = getTypes(point)
        const date = new Date(point['Date']);
        dates.push(date.toDateString())
        types.push(...t);
    });

    types.push(...state.typeFilter);

    types = uniq(types);
    dates = uniq(dates);

    const sortedDates = dates.sort((date1, date2) => date2.valueOf() - date1.valueOf());

    console.log(types);
    console.log(sortedDates);

    const materialOptions = types.filter(t => materials.includes(t)).sort();
    const brandOptions = types.filter(t => brands.includes(t)).sort();
    const objectOptions = types.filter(t => objects.includes(t)).sort();

    const otherOptions = types.filter(t => {
        return !materials.includes(t) && !brands.includes(t) && !objects.includes(t);
    }).sort();;

    return (
        <div>
            <Grid templateColumns="repeat(4, 1fr)" gap={6} style={{ width: '60%' }}>
                <Select
                    isMulti
                    options={materialOptions.map((type) => {
                        return {
                            label: `${type} (${countPointsOfType(points, type)})`, value: type
                        }
                    })}
                    maxMenuHeight={120}
                    styles={customStyles}
                    style={{ width: '100%' }}
                    placeholder={`Select material(s) - ${materialOptions.length} total`}
                    onChange={(selected) => {
                        state.setTypeFilter(selected.map(val => val.value));
                    }}
                />
                <Select
                    isMulti
                    options={objectOptions.map((type) => {
                        return {
                            label: `${type} (${countPointsOfType(points, type)})`, value: type
                        }
                    })}
                    styles={customStyles}
                    maxMenuHeight={120}
                    style={{ width: '100%' }}
                    placeholder={`Select object(s) - ${objectOptions.length} total`}
                    onChange={(selected) => {
                        state.setTypeFilter(selected.map(val => val.value));
                    }}
                />
                <Select
                    isMulti
                    options={brandOptions.map((type) => {
                        return {
                            label: `${type} (${countPointsOfType(points, type)})`, value: type
                        }
                    })}
                    styles={customStyles}
                    maxMenuHeight={120}
                    style={{ width: '100%' }}
                    placeholder={`Select brand(s) - ${brandOptions.length} total`}
                    onChange={(selected) => {
                        state.setTypeFilter(selected.map(val => val.value));
                    }}
                />
                <Select
                    isMulti
                    options={otherOptions.map((type) => {
                        return {
                            label: `${type} (${countPointsOfType(points, type)})`, value: type
                        }
                    })}
                    styles={customStyles}
                    maxMenuHeight={120}
                    style={{ width: '100%' }}
                    placeholder={`Select other type(s) - ${otherOptions.length} total`}
                    onChange={(selected) => {
                        state.setTypeFilter(selected.map(val => val.value));
                    }}
                />
                <Select
                    isMulti
                    options={dates.map((date) => {
                        return {
                            label: `${date} (${getPointsWithDate(points, date)})`, value: date
                        }
                    })}
                    styles={customStyles}
                    maxMenuHeight={120}
                    style={{ width: '100%' }}
                    placeholder={`Select day(s) - ${dates.length} total`}
                    onChange={(selected) => {
                        
                    }}
                />
            </Grid>
        </div>
    );
}

function App() {

    L.Icon.Default.imagePath = "images/"

    const { points, typeFilter } = useStore();

    return (
        <ChakraProvider>
            <div className="App">

                <MyDropzone />

                <Flex color="black" maxH='80vh'>

                    <Box w='full'>

                        <MapContainer className="markercluster-map" center={[45.523064, -122.676483]} zoom={4}
                            maxZoom={18} scrollWheelZoom={true} style={{ margin: '0', padding: '0', maxHeight: '60vh' }}>
                            <TileLayer
                                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <MarkerClusterGroup>

                                {points.map?.((point) => {

                                    const types = getTypes(point);
                                    if (typeFilter.length > 0) {
                                        console.log(types);
                                        if (!typeFilter.every((val) => types.includes(val))) {
                                            return;
                                        }
                                    }

                                    const pos = point['Location (Lat / Long)'].split('/');
                                    return (
                                        <Marker position={pos} key={point['Location (Lat / Long)'] + Math.random()}>
                                            <Popup>
                                                {point['Tags']}
                                            </Popup>
                                        </Marker>
                                    )
                                })}
                            </MarkerClusterGroup>

                        </MapContainer>
                    </Box>
                </Flex>
                <div style={{ minHeight: 300 }}>
                    <SliderControl />
                </div>

            </div>
        </ChakraProvider>
    );
}

export default App;
