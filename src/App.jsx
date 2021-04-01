import './App.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet';
import React, { useCallback } from 'react';
import { uniq } from 'lodash';
import { useDropzone } from 'react-dropzone'
import { Box, ChakraProvider, Checkbox, CheckboxGroup, Flex, VStack } from "@chakra-ui/react"
import { useStore } from './store';

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

    return (
        <div>
            <VStack>
                <p>Selected</p>
            </VStack>
            <VStack>
                <CheckboxGroup >

                    {types.sort().map((type) => {
                        const checked = state.typeFilter.includes(type);
                        console.log('checked, filter, type', checked, state.typeFilter, `'${type}'`);
                        return (
                            <Checkbox isChecked={checked} onChange={(e) => {
                                if (checked) {
                                    state.setTypeFilter(state.typeFilter.filter((val) => val !== type));
                                } else {
                                    state.setTypeFilter(uniq([...state.typeFilter, type]));
                                }
                            }}>{type}</Checkbox>
                        )
                    })}
                </CheckboxGroup>
            </VStack>

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

                        <MapContainer center={[45.523064, -122.676483]} zoom={10} scrollWheelZoom={true} style={{ margin: '0', padding: '0' }}>
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
                    <Box w='256px' overflowY='scroll'>
                        <SliderControl />
                    </Box>
                </Flex>
            </div>
        </ChakraProvider>
    );
}

export default App;
