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
import DayPickerInput from 'react-day-picker/DayPickerInput'
import 'react-day-picker/lib/style.css';
import { formatDate, parseDate } from 'react-day-picker/moment';
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
                let date = new Date(imgData.DateTimeOriginal ?? new Date()) || new Date();
                return {
                    Date: date,
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
    const setTypeFilter = useStore((s) => s.setTypeFilter);
    const allPoints = useStore((s) => s.points);
    const setMaterialFilter = useStore((s) => s.setMaterialFilter);
    const setObjectFilter = useStore((s) => s.setObjectFilter);
    const setBrandFilter = useStore((s) => s.setBrandFilter);
    const setOtherFilter = useStore((s) => s.setOtherFilter);

    let materialFilter = useStore((s) => s.materialFilter);
    let objectFilter = useStore((s) => s.objectFilter);
    let brandFilter = useStore((s) => s.brandFilter);
    let otherFilter = useStore((s) => s.otherFilter);
    let types = [];
    let dates = [];
    const typeFilter = [...materialFilter, ...objectFilter, ...brandFilter, ...otherFilter];

    // Based on sample data.
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
                        setMaterialFilter(selected.map(val => val.value));
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
                        setObjectFilter(selected.map(val => val.value));
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
                        setBrandFilter(selected.map(val => val.value));
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
                        setOtherFilter(selected.map(val => val.value));
                    }}
                />
            </Grid>
        </div>
    );
}

function getToday() {
    // Get date.
    let currentYear = new Date().getFullYear();
    let currentMonth = new Date().getMonth() + 1;
    let currentDay = new Date().getDate();

    // Need a 0 if value < 10.
    if(currentMonth < 10) {
        currentMonth = "0" + currentMonth;
    }
    if(currentDay < 10) {
        currentDay = "0" + currentDay;
    }

    return currentYear + "-" + currentMonth + "-" + currentDay;
}

function SliderControl() {
    let dateFilter = useStore((s) => s.dateFilter);
    let setDateFilter = useStore((s) => s.setDateFilter);
    let newDateFilter = [];

    return (
        <div>
            <label for="first">From: </label>
            <input type="date" id="first" max={getToday()} onChange={function() {
                // Get date.
                let minValue = document.getElementById("first").value;
                let minDate = new Date(minValue);
                let minYear = minDate.getFullYear();
                let minMonth = minDate.getMonth() + 1;
                let minDay = minDate.getDate() + 1;

                // Need a 0 if value < 10.
                if(minMonth < 10) {
                    minMonth = "0" + minMonth;
                }
                if(minDay < 10) {
                    minDay = "0" + minDay;
                }

                // Set minimum value for last date.
                document.getElementById("last").min = minYear + "-" + minMonth + "-" + minDay;
            }}/>
            <br/>
            <label for="last">To: </label>
            <input type="date" id="last" max={getToday()} onChange={function() {
                // Get date.
                let maxValue = document.getElementById("last").value;
                let maxDate = new Date(maxValue);
                let maxYear = maxDate.getFullYear();
                let maxMonth = maxDate.getMonth() + 1;
                let maxDay = maxDate.getDate() + 1;

                // Need a 0 if value < 10.
                if(maxMonth < 10) {
                    maxMonth = "0" + maxMonth;
                }
                if(maxDay < 10) {
                    maxDay = "0" + maxDay;
                }

                // Set maximum value for first date.
                document.getElementById("first").max = maxYear + "-" + maxMonth + "-" + maxDay;
            }}/>
            <br/>
            <button onClick={function() {
                // Get dates.
                var first = document.getElementById("first").value;
                var last = document.getElementById("last").value;
                var date1 = new Date(first);
                var date2 = new Date(last);

                // Need two dates and a logical range.
                if(date1.toDateString().localeCompare("Invalid Date") == 0 ||
                    date2.toDateString().localeCompare("Invalid Date") == 0 || date1.getTime() > date2.getTime()) {
                    alert("Not enough dates, or range is invalid.")
                    return;
                }

                console.log(date1.toDateString());
                console.log(date2.toDateString());

                var newDateFilter = [];

                // In PST, the dates that were selected were one day ahead of what the console showed.
                if(date1.toString().includes("GMT-")) {
                    date1.setDate(date1.getDate() + 1);
                }
                if(date2.toString().includes("GMT-")) {
                    date2.setDate(date2.getDate() + 1);
                }

                newDateFilter.push(date1.toDateString());
                date1.setDate(date1.getDate() + 1);

                // Add dates between first and last dates.
                while(date1.getTime() < date2.getTime()) {
                    var dateToAdd = date1.toDateString();
                    newDateFilter.push(dateToAdd);
                    date1.setDate(date1.getDate() + 1);
                }

                // Add second date and set filter.
                newDateFilter.push(date2.toDateString());
                console.log(newDateFilter);
                setDateFilter(newDateFilter);
            }}>Filter by Dates</button>
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
