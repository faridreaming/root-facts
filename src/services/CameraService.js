export class CameraService {
  constructor() {
    this.stream = null;
    this.video = null;
    this.canvas = null;
    this.config = null;
    this.frameInterval = 1000 / 30;
    this.lastFrameTime = 0;
  }

  setVideoElement(videoElement) {
    this.video = videoElement;
  }

  setCanvasElement(canvasElement) {
    this.canvas = canvasElement;
  }

  // TODO [Basic] Tambahkan konfigurasi kamera untuk mendapatkan daftar perangkat input video
  // TODO [Basic] Dapatkan constraints kamera berdasarkan konfigurasi dan kamera yang dipilih
  async loadCameras() {}

  async startCamera(cameraType = 'default') {
    this.stopCamera();

    const facingMode = cameraType === 'front' ? 'user' : 'environment';

    const constraints = {
      video: {
        facingMode,
        width: { ideal: 640 },
        height: { ideal: 480 },
      },
      audio: false,
    };

    try {
      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.video.srcObject = this.stream;

      await new Promise((resolve, reject) => {
        this.video.onloadedmetadata = resolve;
        this.video.onerror = reject;
      });

      await this.video.play();
      console.log('✅ Kamera aktif');
    } catch (error) {
      console.error('❌ Gagal membuka kamera:', error);
      throw error;
    }
  }

  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }

    if (this.video) {
      this.video.srcObject = null;
    }

    console.log('🛑 Kamera dihentikan');
  }

  setFPS(fps) {
    this.frameInterval = 1000 / fps;
  }

  shouldProcessFrame() {
    const now = performance.now();
    if (now - this.lastFrameTime >= this.frameInterval) {
      this.lastFrameTime = now;
      return true;
    }
    return false;
  }

  isActive() {
    return this.stream !== null && this.stream.active;
  }

  isReady() {
    return this.video !== null && this.video.readyState >= 2;
  }
}
