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
import MapComponent from './components/map.component'

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
  const generateRandomFeatures = useCallback(
    (el = null, ar = null) => {
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
    },
    [userLocation]
  )

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
            <Grid flexGrow={1} maxHeight={{ xs: '70vh', lg: '100vh' }}>
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
              <Stack width="100%">
                <Grid size={{ xs: 12, lg: 6 }}>
                  <Typography variant="h6">Elementos</Typography>
                </Grid>
                <Grid size={{ xs: 12, lg: 6 }}>
                  <ButtonGroup variant="contained" aria-label="elementos">
                    <Button
                      onClick={() => generateRandomFeatures(1, null)}
                      startIcon={<Add />}
                      size="small"
                    >
                      El
                    </Button>
                    <Button
                      onClick={() => generateRandomFeatures(null, 1)}
                      startIcon={<Add />}
                      size="small"
                    >
                      Ar
                    </Button>
                  </ButtonGroup>
                </Grid>
                <Grid size={12}>
                  <List
                    dense
                    sx={{
                      maxHeight: { xs: '20vh', lg: '90vh' },
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
                          onClick={() => setPosition([el.lat, el.lng])}
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
