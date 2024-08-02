'use client';

import React, { useState, useEffect } from 'react';
import { Box, Stack, Typography, Button, Modal, TextField } from '@mui/material';
import SearchAppBar from './header';
import { firestore } from './firebase';
import {
  collection, doc, getDocs, query, setDoc, deleteDoc, getDoc,
} from 'firebase/firestore';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'white',
  border: 'none',
  borderRadius: '16px',
  boxShadow: '0 0 15px rgba(0, 123, 255, 0.5)', // Blue glow effect
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
};

const fontStyle = {
  fontFamily: '"Source Code Pro", monospace'
};

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const itemsPerPage = 5;

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'));
    const docs = await getDocs(snapshot);
    const inventoryList = [];
    docs.forEach((doc) => {
      inventoryList.push({ name: doc.id, ...doc.data() });
    });
    setInventory(inventoryList);
    setFilteredInventory(inventoryList);
  };

  useEffect(() => {
    updateInventory();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      setFilteredInventory(
        inventory.filter(item =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setFilteredInventory(inventory);
    }
    setCurrentPage(1); // Reset to first page on search
  }, [searchQuery, inventory]);

  const addItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, { quantity: quantity + 1 });
    } else {
      await setDoc(docRef, { quantity: 1 });
    }
    await updateInventory();
  };

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { quantity: quantity - 1 });
      }
    }
    await updateInventory();
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImageToGallery = async () => {
    if (uploadedImage) {
      try {
        const galleryRef = collection(firestore, 'gallery');
        await addDoc(galleryRef, {
          imageUrl: uploadedImage,
          timestamp: new Date(),
        });
        setUploadedImage(null); // Reset the image after upload
        alert('Image uploaded successfully!');
      } catch (error) {
        console.error('Error uploading image: ', error);
        alert('Failed to upload image.');
      }
    } else {
      alert('No image selected!');
    }
  };

  // Modal control functions
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  // Pagination control functions
  const totalPages = Math.ceil(filteredInventory.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const selectedInventory = filteredInventory.slice(startIndex, startIndex + itemsPerPage);

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <Box>
      <SearchAppBar setSearchQuery={setSearchQuery} />
      <Box
        display="flex"
        width="100vw"
        height="100vh"
        justifyContent="center"
        alignItems="center"
        gap={2}
      >
        {/* Left side for image upload */}
        <Box
          width="40%"
          display="flex"
          flexDirection="column"
          alignItems="center"
          gap={2}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              padding: 2,
              borderRadius: '16px',
              boxShadow: '0 0 15px rgba(0, 123, 255, 0.5)', // Blue glow effect
              width: '100%',
              maxWidth: '400px',
            }}
          >
            <Typography variant="h6" sx={{ ...fontStyle, color: '#FFFFFF' }}>
              Upload an Image
            </Typography>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="contained-button-file"
              type="file"
              onChange={handleFileUpload}
            />
            <label htmlFor="contained-button-file">
              <Button variant="contained" component="span">
                Choose File
              </Button>
            </label>
            {uploadedImage && (
              <Box sx={{ mt: 2 }}>
                <img src={uploadedImage} alt="Uploaded" style={{ maxWidth: '100%', borderRadius: '16px' }} />
              </Box>
            )}
          </Box>
        </Box>

        {/* Right side for inventory display */}
        <Box
          width="55%" // Reduced width to ensure it fits within the screen
          display="flex"
          flexDirection="column"
          alignItems="center"
          gap={2}
          mr={3} // Added margin-right to ensure proper positioning
        >
          {/* Add Button above the inventory box */}
          <Button 
            variant="contained" 
            onClick={handleOpen} 
            sx={{ ...fontStyle, mb: 2 }}
          >
            Add Item
          </Button>

          <Box
            width="100%"
            border="none"
            borderRadius="16px"
            boxShadow="0 0 15px rgba(0, 123, 255, 0.5)" // Blue glow effect
            bgcolor="#f0f0f0"
            height="100%"
          >
            <Box
              width="100%"
              height="70px"
              bgcolor="#ADD8E6"
              display="flex"
              justifyContent="center"
              alignItems="center"
              borderRadius="16px 16px 0 0"
            >
              <Typography variant="h4" color="#333" textAlign="center" sx={fontStyle}>
                Inventory Items
              </Typography>
            </Box>
            <Stack width="100%" height="calc(100% - 140px)" spacing={2} overflow="auto">
              {selectedInventory.map(({ name, quantity }) => (
                <Box
                  key={name}
                  width="100%"
                  minHeight="100px"
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  bgcolor="#f0f0f0"
                  paddingX={2} // Reduced horizontal padding
                  borderRadius="8px"
                  boxShadow="0 0 10px rgba(0, 123, 255, 0.3)" // Blue glow effect
                >
                  <Typography variant="h5" color="#333" sx={fontStyle}>
                    {name.charAt(0).toUpperCase() + name.slice(1)}
                  </Typography>
                  <Typography variant="h5" color="#333" sx={fontStyle}>
                    Quantity: {quantity}
                  </Typography>
                  <Button variant="contained" onClick={() => removeItem(name)} sx={{ ...fontStyle, minWidth: '80px' }}>
                    Remove
                  </Button>
                </Box>
              ))}
            </Stack>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              padding={2}
            >
              <Button 
                onClick={handlePrevious} 
                disabled={currentPage === 1}
                sx={{ ...fontStyle }}
              >
                Previous
              </Button>
              <Typography sx={{ ...fontStyle }}>
                Page {currentPage} of {totalPages}
              </Typography>
              <Button 
                onClick={handleNext} 
                disabled={currentPage === totalPages}
                sx={{ ...fontStyle }}
              >
                Next
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={{ ...style, ...fontStyle }}>
          <Typography id="modal-modal-title" variant="h6" component="h2" sx={fontStyle}>
            Add Item
          </Typography>
          <Stack width="100%" direction="row" spacing={2}>
            <TextField
              id="outlined-basic"
              label="Item"
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              sx={fontStyle}
            />
            <Button
              variant="outlined"
              onClick={() => {
                addItem(itemName);
                setItemName('');
                handleClose();
              }}
              sx={fontStyle}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>
    </Box>
  );
}
