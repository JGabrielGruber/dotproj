import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  MapContainer,
  TileLayer,
  Marker,
  Polygon,
  useMapEvents,
  useMap,
} from 'react-leaflet'
import L, { GridLayer } from 'leaflet' // Import Leaflet library directly for custom icons
import 'leaflet/dist/leaflet.css' // Import Leaflet's CSS
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  Grid,
  Stack,
  Container,
  Paper,
  ButtonGroup,
} from '@mui/material'
import MyLocationIcon from '@mui/icons-material/MyLocation'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import SquareIcon from '@mui/icons-material/Square'
import CircleIcon from '@mui/icons-material/Circle'
import ChangeHistoryIcon from '@mui/icons-material/ChangeHistory'
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt' // Icon for direction (still imported for potential future use, but not used in off-screen indicator)
import { renderToString } from 'react-dom/server' // To render MUI icons to HTML string for divIcon
import { Add } from '@mui/icons-material'
import DrawingLayer from './components/drawing.layer'

// Fix for default Leaflet icon issue with Webpack/CRA
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
})

// Helper function to generate a random color
const getRandomColor = () => {
  const letters = '0123456789ABCDEF'
  let color = '#'
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)]
  }
  return color
}

// Custom icon for user's location marker
const userLocationIcon = L.divIcon({
  html: renderToString(
    <LocationOnIcon
      style={{ fontSize: 30, color: '#dc2626', fill: '#ef4444' }}
    />
  ),
  className: 'custom-user-location-icon',
  iconSize: [30, 30],
  iconAnchor: [15, 30], // Center bottom of the icon
})

// Component to handle map events and update parent state
const MapEventUpdater = ({ onViewportChanged }) => {
  const map = useMapEvents({
    move: () => {
      onViewportChanged({
        center: [map.getCenter().lat, map.getCenter().lng],
        zoom: map.getZoom(),
      })
    },
    zoomend: () => {
      onViewportChanged({
        center: [map.getCenter().lat, map.getCenter().lng],
        zoom: map.getZoom(),
      })
    },
  })
  return null
}

// Component to render elements (both on-screen markers and off-screen indicators)
const ElementLayer = ({
  elements,
  mapContainerRef,
  createElementIcon,
  mapCenter,
  mapZoom,
  position,
}) => {
  const map = useMap() // Get the Leaflet map instance within MapContainer context
  const [offScreenIndicators, setOffScreenIndicators] = useState([])

  useEffect(() => {
    if (position) {
      map.flyTo(position)
    }
  }, [position, map])

  useEffect(() => {
    if (!map || !mapContainerRef.current || !elements.length) {
      setOffScreenIndicators([])
      return
    }

    const newOffScreenIndicators = []
    const mapBounds = map.getBounds()
    const mapContainerRect = mapContainerRef.current.getBoundingClientRect()
    const mapContainerWidth = mapContainerRect.width
    const mapContainerHeight = mapContainerRect.height
    const padding = 20 // Padding from the edge of the map container

    elements.forEach((el) => {
      const latLng = L.latLng(el.lat, el.lng)

      // Only add to offScreenIndicators if the element is NOT visible on the map
      if (!mapBounds.contains(latLng)) {
        const point = map.latLngToContainerPoint(latLng) // Pixel position relative to map container

        let x = point.x
        let y = point.y

        // Clamp x and y to the container boundaries with padding
        x = Math.max(padding, Math.min(x, mapContainerWidth - padding))
        y = Math.max(padding, Math.min(y, mapContainerHeight - padding))

        newOffScreenIndicators.push({
          id: latLng,
          x: x,
          y: y,
          color: el.color,
          label: el.label,
          latLng: latLng, // Store original latLng for potential click to pan
          type: el.type, // Pass element type for rendering its icon
          size: el.size, // Pass element size for rendering its icon
        })
      }
    })
    setOffScreenIndicators(newOffScreenIndicators)
  }, [map, elements, mapContainerRef, mapCenter, mapZoom]) // Added mapCenter and mapZoom to dependencies

  // Function to pan map to an element's location
  const panToElement = useCallback(
    (latLng) => {
      if (map) {
        map.panTo(latLng)
      }
    },
    [map]
  )

  return (
    <>
      {/* Render ALL elements as Leaflet Markers. Leaflet handles their visibility efficiently. */}
      {elements.map((el, index) => (
        <Marker
          key={`element-${index}`}
          position={[el.lat, el.lng]}
          icon={createElementIcon(el.type, el.color, el.size, el.label)}
          eventHandlers={{
            click: () => alert(`Clicked on visible element: ${el.label}`), // Example click handler
          }}
        />
      ))}

      {/* Render off-screen indicators only for elements that are NOT visible */}
      {offScreenIndicators.map((indicator) => (
        <Box
          key={`indicator-${indicator.id}`}
          sx={{
            position: 'absolute',
            left: indicator.x,
            top: indicator.y,
            transform: `translate(-50%, -50%)`, // No rotation needed for the icon itself
            zIndex: 1000, // Ensure it's on top
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 40, // Beefier size
            height: 40, // Beefier size
            borderRadius: '50%',
            backgroundColor: indicator.color + 'CC', // Semi-transparent background
            border: `3px solid ${indicator.color}`, // Beefier border
            boxShadow: '0 4px 8px rgba(0,0,0,0.4)', // More prominent shadow
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: indicator.color,
            },
          }}
          title={`Go to ${indicator.label}`}
          onClick={() => panToElement(indicator.latLng)} // Click to pan to the element
        >
          {/* Render the actual element icon here */}
          {indicator.type === 'circle' && (
            <CircleIcon style={{ fontSize: 30, color: '#fff' }} />
          )}
          {indicator.type === 'square' && (
            <SquareIcon style={{ fontSize: 30, color: '#fff' }} />
          )}
          {indicator.type === 'triangle' && (
            <ChangeHistoryIcon style={{ fontSize: 30, color: '#fff' }} />
          )}
        </Box>
      ))}
    </>
  )
}

// --- MapComponent.jsx ---
const MapComponent = ({ center, zoom, elements, areas, onViewportChanged, position }) => {
  const mapContainerRef = useRef(null) // Ref for the map container's dimensions
  const [selectedArea, setSelectedArea] = useState(null)

  // Function to create custom DivIcons for elements (moved to MapComponent as it's passed to ElementLayer)
  const createElementIcon = useCallback((type, color, size, label) => {
    let iconComponent
    const iconStyle = { fontSize: size, color: color, fill: color + 'ff' }

    switch (type) {
      case 'circle':
        iconComponent = <CircleIcon style={iconStyle} />
        break
      case 'square':
        iconComponent = <SquareIcon style={iconStyle} />
        break
      case 'triangle':
        iconComponent = <ChangeHistoryIcon style={iconStyle} />
        break
      default:
        iconComponent = <LocationOnIcon style={iconStyle} />
    }

    return L.divIcon({
      html: `<div style="position: relative; width: ${size}px; height: ${size}px;">${renderToString(iconComponent)}<div style="position: absolute; top: -15px; left: 50%; transform: translateX(-50%); font-size: 10px; color: black; white-space: nowrap;">${label}</div></div>`,
      className: 'custom-element-icon',
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2], // Center the icon
    })
  }, [])

  const handleAreaClick = (area, e) => {
    setSelectedArea(area)
  }

  return (
    <Box
      ref={mapContainerRef}
      height="100%"
      width="100%"
      sx={{
        flexGrow: 1,
        position: 'relative',
        borderRadius: '4px',
        overflow: 'hidden',
      }}
    >
      <MapContainer
        center={center}
        dragging={true}
        doubleClickZoom={false}
        zoom={zoom}
        maxZoom={22}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        {/* Minimalist (OpenStreetMap) up to zoom 18 */}
        {zoom <= 18 && (
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            maxZoom={18}
          />
        )}
        {/* Free Satellite (USGS Landsat) for zoom 19-20 */}
        {zoom >= 19 && (
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution='© <a href="https://www.usgs.gov/">USGS</a>'
            maxZoom={22}
            maxNativeZoom={18}
          />
        )}

        {/* Component to update parent's viewport state */}
        <MapEventUpdater onViewportChanged={onViewportChanged} />

        {/* User's current location marker */}
        {!center && <Marker position={center} icon={userLocationIcon} />}

        {/* ElementLayer handles rendering visible elements and off-screen indicators */}
        <ElementLayer
          elements={elements}
          mapContainerRef={mapContainerRef}
          createElementIcon={createElementIcon}
          mapCenter={center} // Pass mapCenter to ElementLayer
          mapZoom={zoom} // Pass mapZoom to ElementLayer
          position={position} // Pass position to ElementLayer
        />

        {/* Render areas as Leaflet Polygons */}
        {areas.map((area, index) => (
          <Polygon
            key={`area-${index}`}
            positions={area.points} // Leaflet Polygon directly accepts [lat, lng] arrays
            pathOptions={{
              color: area.color,
              fillColor: area.color + '30', // Semi-transparent fill
              weight: 2,
            }}
            eventHandlers={{
              click: (e) => handleAreaClick(area, e),
            }}
          />
        ))}
        <DrawingLayer onChange={console.log} onCancel={console.log} onSave={console.log} value={selectedArea} />
      </MapContainer>
    </Box>
  )
}

function MapPage() {
  const [userLocation, setUserLocation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [elements, setElements] = useState([])
  const [areas, setAreas] = useState([])
  const [mapViewport, setMapViewport] = useState({ center: [0, 0], zoom: 18 })
  const [position, setPosition] = useState(null)

  // Fetch user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setUserLocation([latitude, longitude])
          setMapViewport((prev) => ({ ...prev, center: [latitude, longitude] }))
          setLoading(false)
        },
        (err) => {
          console.error('Geolocation error:', err)
          setError(
            'Unable to retrieve your location. Please enable location services.'
          )
          setLoading(false)
          // Default to a known location if user denies/error
          setUserLocation([34.052235, -118.243683]) // Los Angeles
          setMapViewport((prev) => ({
            ...prev,
            center: [34.052235, -118.243683],
          }))
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      )
    } else {
      setError('Geolocation is not supported by your browser.')
      setLoading(false)
      // Default to a known location if geolocation not supported
      setUserLocation([34.052235, -118.243683]) // Los Angeles
      setMapViewport((prev) => ({ ...prev, center: [34.052235, -118.243683] }))
    }
  }, [])

  // Generate random elements and areas around the user's location
  const generateRandomFeatures = useCallback((el = null, ar = null) => {
    if (!userLocation) return

    const [lat, lng] = userLocation

    const newElements = []
    const newAreas = []

    const radius = 0.002 // ~5km radius for random generation

    let is = 10
    if (el || ar) {
      is = el || 0
    }

    // Generate random elements (markers)
    for (let i = 0; i < is; i++) {
      const randomLat = lat + (Math.random() - 0.5) * 2 * radius
      const randomLng = lng + (Math.random() - 0.5) * 2 * radius
      const types = ['circle', 'square', 'triangle']
      newElements.push({
        lat: randomLat,
        lng: randomLng,
        color: getRandomColor(),
        size: Math.floor(Math.random() * 20) + 20, // Size between 20 and 40
        type: types[Math.floor(Math.random() * types.length)],
        label: `Element ${i + 1}`,
      })
    }

    is = 2
    if (ar || el) {
      is = ar || 0
    }

    // Generate random areas (polygons)
    for (let i = 0; i < is; i++) {
      const numPoints = Math.floor(Math.random() * 3) + 3 // 3 to 5 points
      const points = []
      for (let j = 0; j < numPoints; j++) {
        const randomLat = lat + (Math.random() - 0.5) * 2 * radius * 0.5 // Smaller radius for polygon points
        const randomLng = lng + (Math.random() - 0.5) * 2 * radius * 0.5
        points.push([randomLat, randomLng])
      }
      newAreas.push({
        id: Math.random().toString(36).substring(2, 15),
        points: points,
        coords: points,
        color: getRandomColor(),
      })
    }
    setElements((state) => {
      if (el || ar) {
        return [...state, ...newElements]
      }
      return newElements
    })
    setAreas((state) => {
      if (el || ar) {
        return [...state, ...newAreas]
      }
      return newAreas
    })
  }, [userLocation])

  // Generate features once user location is available
  useEffect(() => {
    if (userLocation) {
      generateRandomFeatures()
    }
  }, [userLocation, generateRandomFeatures])

  // Handle viewport changes from MapEventUpdater
  const handleViewportChanged = useCallback(({ center, zoom }) => {
    setMapViewport({ center, zoom })
  }, [])

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <CircularProgress />
        <Typography variant="h6">Fetching your location...</Typography>
      </Box>
    )
  }

  if (error) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <Alert severity="error">{error}</Alert>
        <Button variant="contained" onClick={generateRandomFeatures}>
          Generate Random Features (using default location)
        </Button>
      </Box>
    )
  }

  return (
    <Stack>
      <Container maxWidth="xl">
        <Paper variant="outlined">
          <Grid
            container
            spacing={2}
            sx={{ height: { xs: '80vh', lg: '100vh' }, flexGrow: 1 }}
            direction={{ xs: 'column', lg: 'row' }}
          >
            <Grid
              flexGrow={1}
              maxHeight={{ xs: '50vh', lg: '100vh' }}
            >
              <MapComponent
                center={mapViewport.center}
                zoom={mapViewport.zoom}
                elements={elements}
                areas={areas}
                onViewportChanged={handleViewportChanged}
                position={position}
              />
            </Grid>

            <Grid container paddingLeft={{ xs: 2, lg: 0 }} paddingRight={2}>
              <Stack>
                <Grid size={{ xs: 12, lg: 6 }}>
                  <Typography variant="h6">Elementos</Typography>
                </Grid>
                <Grid size={{ xs: 12, lg: 6 }}>
                  <ButtonGroup variant="contained" aria-label="elementos">
                    <Button onClick={() => generateRandomFeatures(1, null)} startIcon={<Add />} size='small'>El</Button>
                    <Button onClick={() => generateRandomFeatures(null, 1)} startIcon={<Add />} size="small">Ar</Button>
                  </ButtonGroup>
                </Grid>
                <Grid size={12}>
                  <List
                    dense
                    sx={{
                      maxHeight: { xs: '30vh', lg: '90vh' },
                      overflowY: 'auto',
                      width: '100%',
                    }}
                  >
                    {elements.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        Nenhum elemento gerado ainda.
                      </Typography>
                    ) : (
                      elements.map((el, index) => (
                        <ListItemButton
                          key={`list-item-${index}`}
                          onClick={() =>
                            setPosition([el.lat, el.lng])
                          }
                        >
                          <ListItemIcon sx={{ minWidth: 35 }}>
                            {el.type === 'circle' && (
                              <CircleIcon
                                style={{ fontSize: 20, color: el.color }}
                              />
                            )}
                            {el.type === 'square' && (
                              <SquareIcon
                                style={{ fontSize: 20, color: el.color }}
                              />
                            )}
                            {el.type === 'triangle' && (
                              <ChangeHistoryIcon
                                style={{ fontSize: 20, color: el.color }}
                              />
                            )}
                          </ListItemIcon>
                          <ListItemText
                            primary={el.label}
                            secondary={`Lat: ${el.lat.toFixed(4)}, Lng: ${el.lng.toFixed(4)}`}
                          />
                        </ListItemButton>
                      ))
                    )}
                  </List>
                </Grid>
              </Stack>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Stack>
  )
}

export default MapPage
