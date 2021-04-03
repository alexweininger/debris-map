import './App.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet';
import React, { useCallback } from 'react';
import { uniq } from 'lodash';
import { useDropzone } from 'react-dropzone'
import { Box, ChakraProvider, Checkbox, CheckboxGroup, Flex, VStack, Grid } from "@chakra-ui/react"
import { useStore } from './store';
import Select from 'react-select'

function MyDropzone() {
    const setPoints = useStore(state => state.setPoints);
    const onDrop = useCallback(acceptedFiles => {
        // Do something with the files
        acceptedFiles.forEach((file) => {
            const reader = new FileReader();
            reader.onload = () => {
                const text = reader.result;
                // do whatever you want with the file contents
                console.log(text);
                setPoints(JSON.parse(text));
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
    return point['Type(s)'].replaceAll(' ', '').split(',');
}

function SliderControl() {

    const state = useStore();

    let types = [];
    let brands = ["caprisun", "mcdonalds"];
    let materials = ["aluminum", "cardboard", "cloth", "glass", "metal", "paper", "plastic", "styrofoam", "wood"];

    const customStyles = {
        option: (provided, state) => ({
            ...provided,
            color: state.isSelected ? 'red' : 'blue',
            fontSize: 12
        })
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
        types.push(...t);
    });

    types.push(...state.typeFilter);

    types = uniq(types);
    console.log(types);
    return (
        <div>
            <Grid templateColumns="repeat(3, 1fr)" gap={6} style={{width: '50%'}}>
            <Select
                isMulti
                options={types.filter(t => materials.includes(t)).sort().map((type) =>  {
                    return {
                        label: type, value: type
                    }
                })}
                maxMenuHeight={100}
                styles={customStyles}
                style={{width: '100%'}}
                placeholder="Select material(s):"
                onChange={(selected) => {
                    state.setTypeFilter(selected.map(val => val.value));
                }}
            />
            <Select
                isMulti
                options={types.filter(t => {
                    return !materials.includes(t) && !brands.includes(t);
                }).sort().map((type) =>  {
                    return {
                        label: type, value: type
                    }
                })}
                maxMenuHeight={100}
                style={{width: '100%'}}
                placeholder="Select object(s):"
                onChange={(selected) => {
                    state.setTypeFilter(selected.map(val => val.value));
                }}
            />
            <Select
                isMulti
                options={types.filter(t => brands.includes(t)).sort().map((type) =>  {
                    return {
                        label: type, value: type
                    }
                })}
                maxMenuHeight={100}
                style={{width: '100%'}}
                placeholder="Select brand(s):"
                onChange={(selected) => {
                    state.setTypeFilter(selected.map(val => val.value));
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

                        <MapContainer center={[45.523064, -122.676483]} zoom={10} scrollWheelZoom={true} style={{ margin: '0', padding: '0', maxHeight: '60vh' }}>
                            <TileLayer
                                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            {points.map?.((point) => {

                                const types = getTypes(point);
                                if (typeFilter.length > 0) {
                                    if (!typeFilter.every((val) => types.includes(val))) {
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
                    </Box>
                    {/*<Box w='256px' overflowY='scroll'>*/}
                    {/*    <SliderControl />*/}
                    {/*</Box>*/}
                </Flex>
                <div style={{minHeight: 300}}>
                    <SliderControl />
                </div>

            </div>
        </ChakraProvider>
    );
}

export default App;
