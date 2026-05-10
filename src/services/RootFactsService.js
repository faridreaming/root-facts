import { pipeline } from '@huggingface/transformers';
import { isWebGPUSupported } from '../utils/common.js';
import { TONE_CONFIG } from '../utils/config.js';

export class RootFactsService {
  constructor() {
    this.generator = null;
    this.isModelLoaded = false;
    this.isGenerating = false;
    this.config = null;
    this.currentBackend = null;
    this.currentTone = TONE_CONFIG.defaultTone;
  }

  async loadModel(onProgress) {
    try {
      onProgress?.(10, 'Memuat model teks...');

      let device = 'wasm';
      if (isWebGPUSupported()) {
        try {
          const adapter = await navigator.gpu.requestAdapter();
          if (adapter) device = 'webgpu';
        } catch (e) {
          console.warn('WebGPU tidak tersedia, pakai wasm');
        }
      }

      console.log('Model teks menggunakan device:', device);

      this.generator = await pipeline(
        'text2text-generation',
        'Xenova/LaMini-Flan-T5-77M',
        {
          dtype: 'q4',
          device,
          progress_callback: (progress) => {
            if (progress.status === 'downloading') {
              const percent =
                Math.round((progress.loaded / progress.total) * 70) + 20;
              onProgress?.(percent, `Mengunduh model teks... ${percent}%`);
            }
          },
        },
      );

      this.isModelLoaded = true;
      onProgress?.(100, 'Model teks siap!');
      console.log('✅ RootFactsService siap, device:', device);
    } catch (error) {
      console.error('❌ Gagal memuat model teks:', error);
      throw error;
    }
  }

  setTone(tone) {
    this.currentTone = tone;
  }

  async generateFacts(vegetableName) {
    if (!this.isReady() || this.isGenerating) return null;

    this.isGenerating = true;

    try {
      const toneConfig = TONE_CONFIG.availableTones.find(
        (t) => t.value === this.currentTone,
      );

      const toneInstruction = toneConfig?.instruction ?? '';

      const prompt = `Give one interesting fun fact about ${vegetableName}. ${toneInstruction} Keep it short, max 2 sentences.`;

      const result = await this.generator(prompt, {
        max_new_tokens: 80,
        temperature: 0.9,
        top_p: 0.95,
        do_sample: true,
      });

      return result[0].generated_text;
    } catch (error) {
      console.error('❌ Gagal generate fakta:', error);
      return null;
    } finally {
      this.isGenerating = false;
    }
  }

  isReady() {
    return this.isModelLoaded && this.generator !== null;
  }
}
