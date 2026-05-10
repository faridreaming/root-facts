import * as tf from '@tensorflow/tfjs';
import { isWebGPUSupported } from '../utils/common';
import '@tensorflow/tfjs-backend-webgpu';

export class DetectionService {
  constructor() {
    this.model = null;
    this.labels = [];
    this.config = null;
  }

  async loadModel(onProgress) {
    try {
      onProgress?.(10, 'Menginisialisasi backend...');
      await this.#initBackend();

      onProgress?.(30, 'Memuat metadata model...');
      const metaRes = await fetch('/model/metadata.json');
      const metadata = await metaRes.json();
      this.labels = metadata.labels;

      onProgress?.(50, 'Memuat bobot model...');
      this.model = await tf.loadLayersModel('/model/model.json');

      onProgress?.(100, 'Model siap!');
      console.log('✅ Model dimuat:', this.labels.length, 'label');
    } catch (error) {
      console.error('❌ Gagal memuat model:', error);
      throw error;
    }
  }

  async predict(imageElement) {
    if (!this.isLoaded() || !imageElement) return null;

    const predictions = tf.tidy(() => {
      const imageTensor = tf.browser.fromPixels(imageElement);
      const resized = tf.image.resizeBilinear(imageTensor, [224, 224]);
      const normalized = resized.toFloat().div(255.0).expandDims(0);
      const output = this.model.predict(normalized);
      return Array.from(output.dataSync());
    });

    const maxIndex = predictions.indexOf(Math.max(...predictions));
    const score = predictions[maxIndex];

    return {
      className: this.labels[maxIndex],
      score,
      confidence: Math.round(score * 100),
      isValid: true,
    };
  }

  isLoaded() {
    return this.model !== null && this.labels.length > 0;
  }

  async #initBackend() {
    if (isWebGPUSupported()) {
      try {
        await tf.setBackend('webgpu');
        await tf.ready();

        if (tf.getBackend() === 'webgpu') {
          this.currentBackend = 'webgpu';
          console.log('✅ Menggunakan backend: WebGPU');
          return;
        }
      } catch (e) {
        console.warn('⚠️ WebGPU gagal, fallback ke WebGL:', e.message);
      }
    }

    await tf.setBackend('webgl');
    await tf.ready();
    this.currentBackend = 'webgl';
    console.log('✅ Menggunakan backend: WebGL');
  }
}
