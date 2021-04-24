import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { Box, Button, Flex, Stack, Badge, Text } from "@chakra-ui/react"
import { useStore } from './store';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import { useState } from 'react';

function getTypes(point) {
    return point['Tags'].replaceAll(' ', '').split(',');
}

const MarkerContent = ({ point }) => {
    const [img, setImg] = useState(false);
    const imgSrc = point['Image URL'];
    const types = getTypes(point);
    const removeComplete = useStore(s => s.removeComplete);
    return (
        <Stack direction='column'>
            <Stack direction="row">
                {types.length === 0 && (
                    <Badge>No tags</Badge>
                )}
                {types.map((type) =>
                    <Badge>{type}</Badge>
                )}
            </Stack>
            <Text fontSize='sm'>
                Date: {new Date(point['Date']).toDateString()}
            </Text>
            <div>

                {img && (
                    <a href={imgSrc} target='_blank'>
                        <img src={imgSrc} />
                    </a>
                )}
                <Stack direction='row' pt='2'>

                    <Button size='xs' onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setImg(!img);
                    }}>
                        {img ? 'Hide image' : 'Show image'}
                    </Button>
                    <Button size='xs' onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        removeComplete(point);
                    }}>
                        Show similar
                        </Button>
                </Stack>

            </div>
        </Stack>
    )
}

const CustomMarker = ({ point }) => {

    const pos = point['Location (Lat / Long)'].split('/');


    return (
        <Marker position={pos} key={pos + Math.random()}>
            <Popup closeOnClick={false} closeButton={true}>
                <MarkerContent point={point} />
            </Popup>
        </Marker>
    );
};

export const Map = ({ setLoading }) => {

    const dateFilter = useStore(s => s.dateFilter);
    const typeFilter = useStore(s => s.typeFilter);
    const points = useStore(s => s.points);

    return (
        <Stack direction='column'>

            <Flex color="black" maxH='80vh'>

                <Box w='full'>

                    <MapContainer className="markercluster-map" center={[45.523064, -122.676483]} zoom={4}
                        maxZoom={18} scrollWheelZoom={true} style={{ margin: '0', padding: '0', maxHeight: '60vh' }}>
                        <TileLayer
                            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <MarkerClusterGroup>


                            {points?.map?.((point, index) => {
                                setLoading('loading');

                                const types = getTypes(point);
                                if (typeFilter.length > 0) {
                                    if (!typeFilter.every((val) => types.includes(val))) {
                                        return;
                                    }
                                }

                                if (dateFilter.length > 0) {
                                    const date = new Date(point['Date']);
                                    if (!dateFilter.includes(date.toDateString())) {
                                        return;
                                    }
                                }

                                if (index === points?.length - 1) {
                                    setLoading('done');
                                }

                                return <CustomMarker point={point} />
                            })}

                        </MarkerClusterGroup>

                    </MapContainer>
                </Box>

            </Flex>
            <Text>
                {points?.length}
            </Text>
        </Stack>

    );
}
