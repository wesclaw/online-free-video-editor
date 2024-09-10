import { useRef, useEffect, useState } from 'react';
import './App.css'

function App() {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [timelineBg, setTimelineBg] = useState(''); 
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const ctxRef = useRef(null);

   const captureTimelineFrames = () => {
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const numberOfFrames = 10; // The number of frames you want to capture
    const frameInterval = video.duration / numberOfFrames; // Calculate the interval between frames

    let frames = [];

    for (let i = 0; i < numberOfFrames; i++) {
      const time = frameInterval * i;
      
      // Set the video to the time of the frame and capture the image
      video.currentTime = time;

      // Use a Promise to capture the frame once the video reaches the correct time
      frames.push(new Promise((resolve) => {
        video.addEventListener('seeked', function captureFrame() {
          canvas.width = video.videoWidth / 10; // Reduce the size of each frame
          canvas.height = video.videoHeight / 10;

          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          // Extract the image data as a base64 encoded string
          const frameDataUrl = canvas.toDataURL('image/jpeg');

          resolve(frameDataUrl);
          video.removeEventListener('seeked', captureFrame); // Remove the event listener
        });
      }));
    }

    // Once all frames are captured, combine them into a background image
    Promise.all(frames).then((frameDataUrls) => {
      // Create a combined image by merging the frames side by side
      const combinedCanvas = document.createElement('canvas');
      combinedCanvas.width = canvas.width * numberOfFrames;
      combinedCanvas.height = canvas.height;
      const combinedCtx = combinedCanvas.getContext('2d');

      frameDataUrls.forEach((dataUrl, index) => {
        const img = new Image();
        img.src = dataUrl;

        img.onload = () => {
          combinedCtx.drawImage(img, index * canvas.width, 0, canvas.width, canvas.height);

          if (index === numberOfFrames - 1) {
            // Once all frames are drawn, set the background image for the timeline div
            setTimelineBg(combinedCanvas.toDataURL('image/jpeg'));
          }
        };
      });
    });
  };

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

  const handleTimelineClick = (event) => {
    if (!videoDuration) return;

    const timeline = event.currentTarget;
    const clickPosition = event.nativeEvent.offsetX;
    const timelineWidth = timeline.offsetWidth;

    // Calculate the time in the video based on the click position
    const clickTime = (clickPosition / timelineWidth) * videoDuration;
    
    // Seek the video to the clicked time
    videoRef.current.currentTime = clickTime;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    ctxRef.current = canvas.getContext('2d');

    video.addEventListener('loadeddata', () => {
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;

      // Set canvas size to fit within the maximum dimensions
      canvas.width = Math.min(videoWidth, 500);
      canvas.height = Math.min(videoHeight, 500);

      setVideoDuration(video.duration);

      video.play();
      drawFrameToCanvas();

      setIsVideoLoaded(true);
    });

    video.addEventListener('timeupdate', () => {
      setCurrentTime(video.currentTime);
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
          <div className="video" onClick={handleTimelineClick}>
          <div 
            style={{ 
              width: `${(currentTime / videoDuration) * 100}%`, 
              height: '100%', 
              backgroundColor: 'red',
              position: 'absolute', 
              top: 0, 
              left: 0 
            }}
          />
          </div>
          {!isVideoLoaded && (
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
        )}
        </div>
        <video ref={videoRef} style={{ display: 'none' }} />
    </div>
    </>
  )
}

export default App
