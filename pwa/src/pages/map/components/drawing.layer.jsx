import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useMap, Polygon, Marker, Popup } from 'react-leaflet'; // Import Popup
import { TextField, ButtonGroup, Button, Box } from '@mui/material'; // Removed Tooltip from MUI as react-leaflet's Tooltip is used directly on Markers
import DeleteIcon from '@mui/icons-material/Delete';
import UndoIcon from '@mui/icons-material/Undo';
import CheckIcon from '@mui/icons-material/Check';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom circle marker icon for vertices
const createCircleIcon = (color = 'green', borderColor = 'black') => L.divIcon({
  className: 'circle-marker',
  html: `<div style="width: 24px; height: 24px; background: ${color}; border-radius: 50%; border: 1px solid ${borderColor};"></div>`,
  iconSize: [24, 24], // Reverted to smaller size
  iconAnchor: [12, 12],
});

const circleIcon = createCircleIcon();
const selectedCircleIcon = createCircleIcon('orange', 'darkorange'); // New icon for selected marker

// Custom square midpoint icon
const squareIcon = L.divIcon({
  className: 'square-icon',
  html: '<div style="width: 16px; height: 16px; background: red; border: 1px solid black;"></div>',
  iconSize: [16, 16], // Reverted to smaller size
  iconAnchor: [8, 8],
});

const DrawingLayer = ({ value, onChange, onCancel = () => { }, onSave = () => { } }) => {
  const map = useMap();
  const [coords, setCoords] = useState([]);
  const [label, setLabel] = useState('');
  const [selectedMarkerIndex, setSelectedMarkerIndex] = useState(null);
  const [originalCoords, setOriginalCoords] = useState([]); // Store original coords for undo
  const [originalLabel, setOriginalLabel] = useState(''); // Store original label for undo
  const markerRefs = useRef([]);
  const polygonRef = useRef(null);
  const popupRef = useRef(null); // Ref for the Popup component

  // Initialize coords and label when value prop changes
  useEffect(() => {
    if (value) {
      setCoords(value.coords || []);
      setLabel(value.label || '');
      setOriginalCoords(value.coords || []);
      setOriginalLabel(value.label || '');
    } else {
      setCoords([]);
      setLabel('');
      setOriginalCoords([]);
      setOriginalLabel('');
    }
    setSelectedMarkerIndex(null);
  }, [value]);

  // Effect to open the popup when the component mounts or value changes, if a polygon exists
  useEffect(() => {
    if (value && polygonRef.current && popupRef.current) {
      // Use a timeout to ensure the polygon and map are fully rendered before opening popup
      console.log(map)
    }
  }, [value, map]);


  // Calculate midpoints between vertices
  const getMidpoints = useCallback((currentCoords) => {
    const midpoints = [];
    if (currentCoords.length < 2) return midpoints;

    for (let i = 0; i < currentCoords.length; i++) {
      const p1 = currentCoords[i];
      const p2 = currentCoords[(i + 1) % currentCoords.length]; // Wrap around for the last segment
      midpoints.push([(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2]);
    }
    return midpoints;
  }, []);

  // Handle vertex drag
  const handleVertexDrag = useCallback((index, e) => {
    const newCoords = [...coords];
    newCoords[index] = [e.latlng.lat, e.latlng.lng];
    setCoords(newCoords);
  }, [coords]);

  // Handle vertex drag end
  const handleVertexDragEnd = useCallback(() => {
    // No specific action needed here unless you want to save on drag end
    // The `coords` state is already updated in `handleVertexDrag`
  }, []);

  // Handle midpoint click (add new vertex)
  const handleMidpointClick = useCallback((midpointIndex) => {
    const midpoints = getMidpoints(coords);
    const newCoord = midpoints[midpointIndex];
    const newCoords = [
      ...coords.slice(0, midpointIndex + 1),
      newCoord,
      ...coords.slice(midpointIndex + 1),
    ];
    setCoords(newCoords);
    setSelectedMarkerIndex(null); // Deselect any active marker
  }, [coords, getMidpoints]);

  // Handle vertex click to select for deletion/undo
  const handleVertexClick = useCallback((index) => {
    setSelectedMarkerIndex(index === selectedMarkerIndex ? null : index);
  }, [selectedMarkerIndex]);

  // Handle marker delete
  const handleDeleteVertex = useCallback((index) => {
    if (coords.length <= 3) return; // Prevent deleting if less than 3 points
    const newCoords = coords.filter((_, i) => i !== index);
    setCoords(newCoords);
    setSelectedMarkerIndex(null); // Deselect after deletion
  }, [coords]);

  // Handle undo vertex position
  const handleUndoVertex = useCallback((index) => {
    if (selectedMarkerIndex !== null && originalCoords[index]) {
      const newCoords = [...coords];
      newCoords[index] = originalCoords[index];
      setCoords(newCoords);
      setSelectedMarkerIndex(null);
    }
  }, [coords, originalCoords, selectedMarkerIndex]);

  // Handle polygon label change
  const handleLabelChange = useCallback((e) => {
    setLabel(e.target.value);
  }, []);

  // Save changes
  const handleSave = useCallback(() => {
    if (coords.length >= 3) {
      onChange({ id: value?.id, coords, label }); // Pass back id if it exists
      onSave({ id: value?.id, coords, label });
      setOriginalCoords(coords); // Update original coords on save
      setOriginalLabel(label);   // Update original label on save
    }
    setSelectedMarkerIndex(null); // Deselect any active marker
    if (popupRef.current) {
      popupRef.current.close(); // Close the popup after saving
    }
  }, [coords, label, onChange, onSave, value?.id]);

  // Cancel changes and revert to original state
  const handleCancel = useCallback(() => {
    setCoords(originalCoords);
    setLabel(originalLabel);
    setSelectedMarkerIndex(null);
    onCancel();
    if (popupRef.current) {
      popupRef.current.close(); // Close the popup after canceling
    }
  }, [originalCoords, originalLabel, onCancel]);

  return (
    <>
      {coords.length > 0 && (
        <>
          <Polygon
            ref={polygonRef}
            positions={coords}
            pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.4 }}
          >
            {/* Using react-leaflet's Popup directly */}
            <Popup ref={popupRef}>
              <Box p={1} display="flex" flexDirection="column" gap={1}>
                <TextField
                  label="Polygon Label"
                  value={label}
                  onChange={handleLabelChange}
                  size="small"
                  fullWidth
                />
                <ButtonGroup fullWidth>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSave}
                    disabled={coords.length < 3}
                    startIcon={<CheckIcon />}
                  >
                    Confirm
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={handleCancel}
                    startIcon={<UndoIcon />}
                  >
                    Revert
                  </Button>
                </ButtonGroup>
              </Box>
            </Popup>
          </Polygon>

          {/* Vertex markers */}
          {coords.map((coord, index) => (
            <Marker
              key={`vertex-${index}-${value?.id || 'new'}`}
              position={coord}
              icon={selectedMarkerIndex === index ? selectedCircleIcon : circleIcon}
              draggable
              ref={(el) => (markerRefs.current[index] = el)}
              eventHandlers={{
                drag: (e) => handleVertexDrag(index, e),
                dragend: handleVertexDragEnd, // Handle drag end
                click: () => handleVertexClick(index),
              }}
            >
              {selectedMarkerIndex === index && (
                <L.Tooltip direction="top" offset={[0, -10]} permanent> {/* Using L.Tooltip directly */}
                  <ButtonGroup size="small">
                    <Button
                      onClick={() => handleDeleteVertex(index)}
                      color="error"
                      disabled={coords.length <= 3} // Disable if less than 3 points remain
                    >
                      <DeleteIcon fontSize="small" />
                    </Button>
                    <Button
                      onClick={() => handleUndoVertex(index)}
                      color="info"
                    >
                      <UndoIcon fontSize="small" />
                    </Button>
                  </ButtonGroup>
                </L.Tooltip>
              )}
            </Marker>
          ))}

          {/* Midpoint markers */}
          {getMidpoints(coords).map((mid, index) => (
            <Marker
              key={`mid-${index}-${value?.id || 'new'}`}
              position={mid}
              icon={squareIcon}
              eventHandlers={{
                click: () => handleMidpointClick(index),
              }}
            />
          ))}
        </>
      )}
    </>
  );
};

export default DrawingLayer;
