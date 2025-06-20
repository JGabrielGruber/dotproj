import React, { useState, useRef, useEffect } from 'react'
import { Dialog, DialogContent, Box, IconButton, ToggleButtonGroup, ToggleButton } from '@mui/material'
import { CameraAlt, Videocam, Close } from '@mui/icons-material'

import { compressImage } from 'src/utils'

const CameraComponent = ({ onCapture, onClose }) => {
  const [mode, setMode] = useState('photo')
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [recording, setRecording] = useState(false);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const constraints = {
          video: {
            facingMode: 'environment',
            width: { ideal: mode === 'photo' ? 1280 : 640 },
            height: { ideal: mode === 'photo' ? 720 : 480 },
            frameRate: mode === 'video' ? { ideal: 15 } : undefined,
          },
        };
        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (e) {
        console.error(e)
        onClose();
      }
    };

    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [mode]);

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
      onCapture(compressedFile);
      onClose();
    } else {
      if (!recording) {
        const chunks = [];
        mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'video/webm' });
        mediaRecorderRef.current.ondataavailable = (e) => chunks.push(e.data);
        mediaRecorderRef.current.onstop = () => {
          const blob = new Blob(chunks, { type: 'video/webm' });
          const file = new File([blob], `video-${Date.now()}.webm`, {
            type: 'video/webm',
            lastModified: Date.now(),
          });
          onCapture(file);
          onClose();
        };
        mediaRecorderRef.current.start();
        setRecording(true);
      } else {
        mediaRecorderRef.current.stop();
        setRecording(false);
      }
    }
  };

  const handleModeChange = (e, newMode) => {
    if (newMode) setMode(newMode);
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
            autoPlay
            playsInline
            style={{ width: '100%', maxHeight: '400px' }}
          />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          <Box sx={{ mt: 2, mb: 2 }}>
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
            <IconButton
              color={recording ? 'error' : 'primary'}
              onClick={handleCapture}
              sx={{ ml: 2 }}
            >
              {mode === 'photo' ? <CameraAlt /> : <Videocam />}
            </IconButton>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default CameraComponent
