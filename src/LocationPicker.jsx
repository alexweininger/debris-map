import React, { useState } from 'react'
import MapPicker from 'react-google-map-picker'
import { Button, Grid, Text } from '@chakra-ui/react';

const DefaultLocation = { lat: 45.57272527331906, lng: -122.72742648601547 };
const DefaultZoom = 10;

const LocationPicker = ({ onAccept }) => {

    const [defaultLocation, setDefaultLocation] = useState(DefaultLocation);

    const [location, setLocation] = useState(defaultLocation);
    const [zoom, setZoom] = useState(DefaultZoom);

    function handleChangeLocation(lat, lng) {
        setLocation({ lat: lat, lng: lng });
    }

    function handleChangeZoom(newZoom) {
        setZoom(newZoom);
    }

    function handleResetLocation() {
        setDefaultLocation({ ...DefaultLocation });
        setZoom(DefaultZoom);
    }

    return (
        <div style={{ height: 400, maxWidth: 400 }}>
            <Button onClick={handleResetLocation}>Reset Location</Button>
            <Grid templateColumns="repeat(2, 1fr)" gap={6} style={{ width: '100%' }}>
                <Text>Longitude: {location.lng.toFixed(4)}</Text>
                <Text>Latitude: {location.lat.toFixed(4)}</Text>
            </Grid>
            <Button onClick={() => onAccept(location)}>Confirm location</Button>
            <MapPicker defaultLocation={defaultLocation}
                zoom={zoom}
                style={{ height: '300px' }}
                onChangeLocation={handleChangeLocation}
                onChangeZoom={handleChangeZoom}
                apiKey='AIzaSyBPgnDvILoH9oiJ8J2IrKH72N-Yss2xCUM' />
        </div>
    );
}

export default LocationPicker;
