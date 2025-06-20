import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, Box, IconButton, ToggleButtonGroup, ToggleButton, LinearProgress, Typography, Stack, Grid } from '@mui/material';
import { CameraAlt, Videocam, Close, SwitchCamera } from '@mui/icons-material';
import { compressImage } from 'src/utils';

const MAX_VIDEO_SIZE = 4.8 * 1024 * 1024; // 4.8MB in bytes
const TIMESLICE = 1000; // Check size every 1s

const CameraComponent = ({ onCapture, onClose }) => {
  const [mode, setMode] = useState('photo');
  const [stream, setStream] = useState(null);
  const [recording, setRecording] = useState(false);
  const [progress, setProgress] = useState(0);
  const [sizeEstimate, setSizeEstimate] = useState(0);
  const [facingMode, setFacingMode] = useState('environment');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const constraints = {
          video: {
            facingMode,
            width: { ideal: mode === 'photo' ? 1920 : 640 },
            height: { ideal: mode === 'photo' ? 1080 : 480 },
            frameRate: { ideal: 15 },
          },
          audio: mode === 'video',
        };
        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (e) {
        console.error('Camera error:', e);
        alert('Failed to access camera. Check permissions.');
        onClose();
      }
    };

    if (!stream) {
      startCamera();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [mode, facingMode, onClose, stream]);

  const handleSubmit = (file) => {
    onCapture({ target: { files: [file] } });
  };

  const handleCapture = async () => {
    if (mode === 'photo') {
      const canvas = canvasRef.current;
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, 'image/jpeg', 0.7)
      );
      const file = new File([blob], `photo-${Date.now()}.jpg`, {
        type: 'image/jpeg',
        lastModified: Date.now(),
      });
      const compressedFile = await compressImage(file, 1280, 720, 0.7);
      handleSubmit(compressedFile);
      onClose();
    } else {
      if (!recording) {
        chunksRef.current = [];
        const mimeType = MediaRecorder.isTypeSupported('video/mp4;codecs=H.264')
          ? 'video/mp4;codecs=H.264'
          : 'video/webm';
        mediaRecorderRef.current = new MediaRecorder(stream, { mimeType });
        mediaRecorderRef.current.ondataavailable = (e) => {
          if (e.data.size > 0) {
            chunksRef.current.push(e.data);
            const currentSize = chunksRef.current.reduce((acc, chunk) => acc + chunk.size, 0);
            setSizeEstimate(currentSize);
            if (currentSize >= MAX_VIDEO_SIZE) {
              mediaRecorderRef.current.stop();
              alert('Video size limit (5MB) reached.');
            }
          }
        };
        mediaRecorderRef.current.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: mimeType });
          const file = new File([blob], `video-${Date.now()}.${mimeType.split('/')[1]}`, {
            type: mimeType,
            lastModified: Date.now(),
          });
          handleSubmit(file);
          setRecording(false);
          clearInterval(timerRef.current);
          onClose();
        };
        mediaRecorderRef.current.start(TIMESLICE); // Periodic data checks
        setRecording(true);
        setProgress(0);
        timerRef.current = setInterval(() => {
          setProgress((prev) => Math.min(prev + 100 / 30, 100)); // 30s max
        }, 1000);
      } else {
        mediaRecorderRef.current.stop();
      }
    }
  };

  const handleModeChange = (e, newMode) => {
    if (newMode) setMode(newMode);
  };

  const handleSwitchCamera = () => {
    setFacingMode(facingMode === 'environment' ? 'user' : 'environment');
  };

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <DialogContent sx={{ p: 0, position: 'relative' }}>
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}
        >
          <Close />
        </IconButton>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <video
            ref={videoRef}
            muted
            autoPlay
            playsInline
            style={{ width: '100%', maxHeight: '400px' }}
          />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          {recording && (
            <>
              <LinearProgress
                variant="determinate"
                value={(sizeEstimate / MAX_VIDEO_SIZE) * 100}
                sx={{ mt: 1, width: '100%' }}
              />
              <Typography variant="caption">
                {(sizeEstimate / 1024 / 1024).toFixed(2)}MB / 5MB
              </Typography>
            </>
          )}
          <Grid
            container
            alignItems="center"
            direction="row"
            spacing={2}
            width="100%"
          >
            <Grid size={2} />
            <Grid size={3}>
              <ToggleButtonGroup
                value={mode}
                exclusive
                onChange={handleModeChange}
                size="small"
              >
                <ToggleButton value="photo">
                  <CameraAlt />
                </ToggleButton>
                <ToggleButton value="video">
                  <Videocam />
                </ToggleButton>
              </ToggleButtonGroup>
            </Grid>
            <Grid size={3}>
              <IconButton
                color={recording ? 'error' : 'primary'}
                onClick={handleCapture}
                size="large"
              >
                {mode === 'photo' ? <CameraAlt /> : <Videocam />}
              </IconButton>
            </Grid>
            <Grid size={2}>
              <IconButton onClick={handleSwitchCamera}>
                <SwitchCamera />
              </IconButton>
            </Grid>
            <Grid size={2} />
          </Grid>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default CameraComponent;
