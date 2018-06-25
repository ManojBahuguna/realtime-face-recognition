const socket = window.io({
  transports: ['websocket']
});

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
  resolve(canvas.toDataURL('image/jpeg', 0.1));
  // canvas.toBlob((blob) => resolve(blob));
});

const sendFrame = (frame) => {
  socket.emit('frame', frame);
};

const getStream = async () =>
  await navigator.mediaDevices.getUserMedia({ video: { width: 400, height: 400, frameRate: 10 } });

const startStreamingToServer = (canvas, timeout = 100) => {
  getCanvasFrame(canvas)
    .then(frame => sendFrame(frame));

  window.setTimeout(() => {
    startStreamingToServer(canvas, timeout);
  }, timeout);
};


const renderers = new Map;
const renderReceivedFrame = (id, frame) => {
  if (!renderers.has(id)) {
    const element = document.createElement('img');
    document.body.appendChild(element);
    renderers.set(id, { element });
  }

  renderers.get(id).src = frame;
};

const removeRenderer = (id) => {
  if (renderers.has(id)) {
    const renderer = renderers.get(id);
    renderer.element.remove();
    renderers.delete(id);
  }
};

const renderingLoop = () => {
  renderers.forEach(({ element, src }) => {
    element.src = src;
  });

  window.requestAnimationFrame(renderingLoop);
};

const init = () => {
  socket.on('connect', async () => {
    const stream = await getStream();
    const video = await createVideoElement(stream);
    const canvas = createCanvasElement(video);
    startStreamingToServer(canvas, 200);

    renderingLoop();
  });


  socket.on('frame', (...data) => {
    renderReceivedFrame(...data);
  })
}

socket.on('endstream', (id) => {
  removeRenderer(id);
});

init();