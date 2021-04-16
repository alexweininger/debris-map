import './App.css';
import L from 'leaflet';
import React, { useCallback, useState } from 'react';
import { uniq } from 'lodash';
import { useDropzone } from 'react-dropzone'
import { Box, ChakraProvider, Grid, Modal, ModalContent, Text, ModalOverlay, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Button } from "@chakra-ui/react"
import { useStore } from './store';
import Select from 'react-select'
import { Map } from './Map';
import exifr from 'exifr/dist/full.esm.mjs'
import { ImgModal } from './ImgModal';

const parse = require('csv-parse');

function isCsv(file) {
    return file.path.endsWith('.csv');
};

const imgFileTypes = ['.jpeg', '.jpg', '.png'];

function isImage(file) {
    return imgFileTypes.some((type) => {
        return file.path.endsWith(type);
    })
}

function MyDropzone() {
    const setPoints = useStore(state => state.setPoints);
    const [csvModal, setCsvModal] = useState(false);
    const [imgModal, setImgModal] = useState(false);
    const [data, setData] = useState();
    const [images, setImages] = useState(undefined);
    const [file, setFile] = useState();
    const [exifData, setExifData] = useState(undefined);
    const [done, setDone] = useState(false);
    const showPoints = useStore(s => s.setShowPoints);

    const onClose = () => {
        setCsvModal(false);
        setImgModal(false);
    }

    const onAccept = (data, tags) => {
        if (tags !== undefined) {
            console.log(data, tags);
            const combined = data.map((imgData, index) => {
                return {
                    Date: new Date(imgData.DateTimeOriginal ?? new Date()) || new Date(),
                    'Location (Lat / Long)': `${imgData.latitude}/${imgData.longitude}`,
                    Tags: tags[index].map((v) => v.label).join(', '),
                    'Image URL': images[index]
                }
            });
            console.log('combined', combined);
            setPoints(combined);
        } else {
            setPoints(data);
        }
        onClose();
    }

    const afterLoad = (file) => {
        if (csvModal) {
            return;
        }
        if (isCsv(file)) {

        } else {
            setImgModal(true);

        }

        setDone(true);
    }

    const onDrop = useCallback(acceptedFiles => {
        const imageData = [];
        const aggExifData = [];
        // Do something with the files
        acceptedFiles.forEach((file) => {
            setFile(file);
            const reader = new FileReader();
            reader.onload = () => {
                const text = reader.result;

                if (isCsv(file)) {
                    setCsvModal(true);
                    parse(text, { columns: true }, (err, output) => {
                        setData(output);
                    });
                    return;
                } else if (isImage(file)) {
                    exifr.parse(text)
                        .then(output => {
                            aggExifData.push(output);
                        }).catch(err => {
                            aggExifData.push({});
                        });

                    imageData.push(text);
                } else {
                    alert('Sorry, only .csv or image files are supported.');
                    return;
                }
            };
            reader.onabort = () => console.log('file reading was aborted');
            reader.onerror = () => console.log('file reading has failed');

            if (isCsv(file)) {

                reader.readAsText(file);
            } else {

                reader.readAsDataURL(file);
            }
            setImages(imageData);
            setExifData(aggExifData);
            afterLoad(file);
        });

    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

    return (
        <div {...getRootProps()}>
            <input {...getInputProps()} accept='.csv, .jpeg, .jpg, .png' />
            {
                isDragActive ?
                    <p>Drop the files here ...</p> :
                    <p>Drag 'n' drop some files here, or click to select files</p>
            }
            <Modal isOpen={csvModal} onClose={(e) => onClose()}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Add data from CSV</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Text>
                            Loaded <strong>{data?.length}</strong> debris from file {file?.path}.
                        </Text>
                    </ModalBody>

                    <ModalFooter>
                        <Button colorScheme="red" mr={3} onClick={() => onClose()}>
                            Cancel
                        </Button>
                        <Button colorScheme="blue" onClick={() => onAccept(data)}>Process</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <ImgModal exifData={exifData} images={images} isOpen={imgModal} onAccept={onAccept} onClose={onClose} />
        </div >
    )
}

function getTypes(point) {
    return point['Tags'].replaceAll(' ', '').split(',');
}

function countPointsOfType(points, type) {
    return points.filter((point) => getTypes(point).includes(type)).length;
}

function getDate(point) {
    return new Date(point['Date']).toDateString();
}

function getPointsWithDate(points, date) {
    return points.filter((point) => getDate(point) === date).length;
}
function TagFilter() {
    const typeFilter = useStore((s) => s.typeFilter);
    const setTypeFilter = useStore((s) => s.setTypeFilter);
    const allPoints = useStore((s) => s.points);

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
    const pointsFilteredByDate = [];

    if (typeFilter.length > 0) {
        allPoints.forEach((point) => {
            const t = getTypes(point);
            const b = typeFilter.every((ct) => t.includes(ct));
            if (b) {
                points.push(point);
            }
        });
    } else {
        points.push(...allPoints);
    }

    points.forEach((point) => {
        const t = getTypes(point)
        types.push(...t);
    });

    types.push(...typeFilter);

    types = uniq(types);
    dates = uniq(dates);
    console.log(types);

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
                        setTypeFilter(selected.map(val => val.value));
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
                        setTypeFilter(selected.map(val => val.value));
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
                        setTypeFilter(selected.map(val => val.value));
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
                        setTypeFilter(selected.map(val => val.value));
                    }}
                />
            </Grid>
        </div>
    );
}

function SliderControl() {
    const points = useStore((s) => s.points);
    let setDateFilter = useStore((s) => s.setDateFilter);
    let dates = [];
    points.forEach((point) => {
        const date = new Date(point['Date']);
        dates.push(date.toDateString());
    });
    dates = uniq(dates).sort((a, b) => {
        return new Date(a) - new Date(b);
    });
    console.log(dates);
    const firstDate = new Date(dates[0]);
    const lastDate = new Date(dates[dates.length - 1]);

    const [selectedInterval, setSelectedInterval] = useState([firstDate, lastDate]);
    return (
        <div>
            <Select
                isMulti
                options={dates.map((date) => {
                    return {
                        label: `${date} (${getPointsWithDate(points, date)})`, value: date
                    }
                })}
                //styles={customStyles}
                maxMenuHeight={220}
                style={{ width: '100%' }}
                placeholder={`Select day(s) - ${dates.length} total`}
                onChange={(selected) => {
                    setDateFilter(selected.map(val => val.value));
                }}
            />
            {/* <TimeRange
                ticksNumber={dates.length}
                selectedInterval={selectedInterval}
                timelineInterval={[firstDate, lastDate]}
                onUpdateCallback={function () {

                }}
                onChangeCallback={(interval) => {
                    console.log(interval);
                    //setDateFilter(interval);
                    //setSelectedInterval(interval);
                }}
            /> */}
        </div>
    );

}
function App() {

    L.Icon.Default.imagePath = "images/";

    const setLoading = useStore(s => s.setMapLoading);


    return (
        <ChakraProvider>
            <div className="App">

                <MyDropzone />

                <Map setLoading={setLoading} />

                <Box minH={300} w='full' minW='full'>
                    <br />

                    <TagFilter />
                    <br />
                    <Box maxW='300'>

                        <SliderControl />
                    </Box>
                </Box>


            </div>
        </ChakraProvider>
    );
}

export default App;
