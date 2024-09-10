import { useRef, useEffect } from 'react';
import './App.css'

function App() {
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const ctxRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const fileURL = URL.createObjectURL(file);
      videoRef.current.src = fileURL;
    }
  };

  const drawFrameToCanvas = () => {
    if (videoRef.current.paused || videoRef.current.ended) return;

    const videoWidth = videoRef.current.videoWidth;
    const videoHeight = videoRef.current.videoHeight;
    
    const canvas = canvasRef.current;
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // Calculate aspect ratio and size for the video to fit within the canvas constraints
    const videoAspectRatio = videoWidth / videoHeight;
    const canvasAspectRatio = canvasWidth / canvasHeight;

    let renderWidth, renderHeight, offsetX, offsetY;

    if (videoAspectRatio > canvasAspectRatio) {
      renderWidth = canvasWidth;
      renderHeight = canvasWidth / videoAspectRatio;
      offsetX = 0;
      offsetY = (canvasHeight - renderHeight) / 2;
    } else {
      renderWidth = canvasHeight * videoAspectRatio;
      renderHeight = canvasHeight;
      offsetX = (canvasWidth - renderWidth) / 2;
      offsetY = 0;
    }

    ctxRef.current.clearRect(0, 0, canvasWidth, canvasHeight);
    ctxRef.current.drawImage(
      videoRef.current,
      0, 0, videoWidth, videoHeight,
      offsetX, offsetY, renderWidth, renderHeight
    );

    requestAnimationFrame(drawFrameToCanvas);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    ctxRef.current = canvas.getContext('2d');

    video.addEventListener('loadeddata', () => {
      console.log('Video loaded');
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;

      // Set canvas size to fit within the maximum dimensions
      canvas.width = Math.min(videoWidth, 500);
      canvas.height = Math.min(videoHeight, 500);

      video.play();
      drawFrameToCanvas();
    });
  }, []);

  // 
  return (
    <>
    <div className='container'>
      <div className="top_two">
      <div className="left">

      </div>
      <div className="right">
        <canvas 
        id='canvas' 
        style={{ minWidth: '420px', maxHeight: '100%', display: 'block', backgroundColor: 'black' }} 
        className='canvas' 
        ref={canvasRef}>
        </canvas>
      </div>
      </div>
        <div className="bottom">
          <div className="video"></div>
          <div className="add_file_screen">
            <button id='add_file_btn' 
            className='addFileBtn' 
            >
            <input 
              type="file" 
              ref={fileInputRef} 
              id="file_input" 
              className="fileInput" 
              accept=".mp4,.gif" 
              onChange={handleFileChange}
              />
              <img className='fileIcon' src="/src/assets/file.png" alt="logo" />
              Choose Video</button>        
          </div>
        </div>
        <video ref={videoRef} style={{ display: 'none' }} />
    </div>
    </>
  )
}

export default App
