const socket = window.io();

const createVideoElement = (stream) => new Promise((resolve) => {
  const video = document.createElement('video');
  video.srcObject = stream;
  video.addEventListener('canplay', () => {
    resolve(video);
    video.play();
  })
});

const createCanvasElement = (video) => {
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.videoElement = video;
  return canvas;
};

const getCanvasFrame = (canvas) => new Promise((resolve) => {
  const ctx = canvas.getContext('2d');
  ctx.drawImage(canvas.videoElement, 0, 0);
  canvas.toBlob((blob) => resolve(blob));
});

const sendFrame = (frame) => {
  socket.emit('frame', frame);
};

const getStream = async () =>
  await navigator.mediaDevices.getUserMedia({ video: true });

const startStreamingToServer = (canvas, timeout = 100) => {
  getCanvasFrame(canvas)
    .then(frame => sendFrame(frame));

  window.setTimeout(() => {
    startStreamingToServer(canvas, timeout);
  }, timeout);
};

const init = () => {
  socket.on('connect', async () => {
    const stream = await getStream();
    const video = await createVideoElement(stream);
    const canvas = createCanvasElement(video);
    startStreamingToServer(canvas);
  });
}

init();