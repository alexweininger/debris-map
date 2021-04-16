import { UnorderedList, ListItem, Grid, Box, Modal, ModalContent, Stack, Text, ModalOverlay, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Button, Image } from "@chakra-ui/react";
import React, { useEffect, useState, Component } from 'react';
import LocationPicker from './LocationPicker';
import { CreatableMulti } from './CreatableSelect';

export const ImgViewer = ({ imgSrc }) => {
    return (
        <Box minW='400' maxW='400'>
            <Image src={imgSrc} maxW='300' mx='auto' fallbackSrc="https://via.placeholder.com/150" />
        </Box>
    );
}




const TagPicker = ({ tags, editTagData, idx }) => {

    return (
        <CreatableMulti onSave={() => console.log('onsave')} value={tags ?? []} editTagData={editTagData} idx={idx} />
    )
}

const DebrisData = ({ exifData, editImageData, idx }) => {

    const [mapPicker, setMapPicker] = useState(false);

    const onSetLocation = ({ lat, lng }) => {
        setMapPicker(false);
        editImageData(idx, { latitude: lat, longitude: lng })
    };

    if (exifData === undefined) {
        return (
            <Box>
                <Text color='red.400'>No data found on image.</Text>
                {!mapPicker && (
                    <Button onClick={() => setMapPicker(true)}>Set location</Button>
                )}

                {mapPicker && (

                    <LocationPicker onAccept={onSetLocation} />
                )}
            </Box>
        );
    }

    return (
        <Box>
            {exifData.latitude && exifData.longitude ? (
                <UnorderedList>
                    <ListItem>Latitude: {exifData.latitude}</ListItem>
                    <ListItem>Longitude: {exifData.longitude}</ListItem>
                </UnorderedList>

            ) : (

                <Box>
                    <LocationPicker />
                </Box>
            )}
        </Box>

    )
};

export const ImgModal = ({ isOpen, images, exifData, onClose, onAccept }) => {

    const [imgIdx, setImgIdx] = useState(0);
    const [loaded, setLoaded] = useState(false);

    const [imageData, setImageData] = useState(exifData);
    const [tagData, setTagData] = useState([]);

    useEffect(() => {
        setImageData(exifData);
    }, [exifData])

    const editImageData = (index, data) => {
        const newImageData = Array.from(imageData);
        newImageData[index] = { ...newImageData[index], ...data };
        setImageData(newImageData);
    }

    const editTagData = (index, tags) => {
        const newTagData = Array.from(tagData);
        newTagData[index] = tags;
        setTagData(newTagData);
        console.log('new tag data: ', newTagData);
    }

    if (!images || !exifData) {
        return <></>;
    }

    return (

        <Modal isOpen={isOpen} onClose={(e) => onClose()} size='4xl' autoFocus={true}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Add data from image</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Grid templateColumns="repeat(2, 1fr)" gap={6} style={{ width: '100%' }}>
                        <Box>

                            {!loaded && (
                                <Button onClick={() => setLoaded(true)}>Click to load images</Button>
                            )}

                            <Stack direction='column' justify='space-between' align='center'>
                                <ImgViewer imgSrc={images[imgIdx]} />
                                <Stack direction='row' alignContent='center' justify='center'>
                                    <Button size='sm' onClick={() => {
                                        setImgIdx(Math.abs((imgIdx - 1) % images.length))
                                    }}>Prev</Button>
                                    <Text>
                                        Viewing image {imgIdx + 1} of {images?.length}
                                    </Text>
                                    <Button size='sm' onClick={() => {
                                        setImgIdx((imgIdx + 1) % images.length)
                                    }}>Next</Button>
                                </Stack>
                            </Stack>
                        </Box>
                        <Box>
                            <Stack direction='column' spacing='4'>
                                <TagPicker tags={tagData?.[imgIdx]} editTagData={editTagData} idx={imgIdx} />
                                <DebrisData exifData={imageData?.[imgIdx]} editImageData={editImageData} idx={imgIdx} />
                            </Stack>
                        </Box>
                    </Grid>

                </ModalBody>

                <ModalFooter>
                    <Button colorScheme="red" mr={3} onClick={() => onClose()}>
                        Cancel
            </Button>
                    <Button colorScheme="blue" onClick={() => onAccept(imageData, tagData)}>Process</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};
