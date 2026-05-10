export const APP_CONFIG = {
  detectionConfidenceThreshold: 70,
  analyzingDelay: 2000,
  factsGenerationDelay: 2000,
  detectionRetryInterval: 100,
};

export const TONE_CONFIG = {
  availableTones: [
    { value: 'normal', label: 'Normal', instruction: '' },
    {
      value: 'funny',
      label: 'Lucu',
      instruction: 'Write it in a funny and humorous way.',
    },
    {
      value: 'professional',
      label: 'Profesional',
      instruction: 'Write it in a formal and professional tone.',
    },
    {
      value: 'casual',
      label: 'Santai',
      instruction: 'Write it in a casual and friendly way.',
    },
  ],
  defaultTone: 'normal',
};

export const isValidDetection = (result) => {
  const { detectionConfidenceThreshold } = APP_CONFIG;
  return (
    result &&
    result.isValid &&
    result.confidence >= detectionConfidenceThreshold
  );
};
