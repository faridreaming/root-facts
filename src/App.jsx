import { useRef, useState, useEffect } from 'react';
import Header from './components/Header';
import CameraSection from './components/CameraSection';
import InfoPanel from './components/InfoPanel';
import { useAppState } from './hooks/useAppState';
import { DetectionService } from './services/DetectionService';
import { CameraService } from './services/CameraService';

function App() {
  const { state, actions } = useAppState();
  const detectionCleanupRef = useRef(null);
  const isRunningRef = useRef(false);
  const [currentTone, setCurrentTone] = useState('normal');

  useEffect(() => {
    const detector = new DetectionService();
    const camera = new CameraService();

    actions.setServices({ detector, camera, generator: null });

    detector
      .loadModel((percent, message) => {
        actions.setModelStatus(`${message} (${percent}%)`);
      })
      .then(() => {
        actions.setModelStatus('Model AI Siap');
      })
      .catch((err) => {
        actions.setModelStatus('Gagal memuat model');
        actions.setError(err.message);
      });
  }, []);

  // TODO [Basic] Bersihkan sumber daya saat komponen ditinggalkan

  const startDetectionLoop = (detector, camera) => {
    isRunningRef.current = true;

    const loop = async () => {
      if (!isRunningRef.current) return;

      if (
        camera.isReady() &&
        detector.isLoaded() &&
        camera.shouldProcessFrame()
      ) {
        const result = await detector.predict(camera.video);

        if (result && result.confidence >= 70) {
          actions.setDetectionResult(result);
          actions.setAppState('result');
        }
      }

      detectionCleanupRef.current = requestAnimationFrame(loop);
    };

    detectionCleanupRef.current = requestAnimationFrame(loop);
  };

  const handleToggleCamera = async () => {
    if (state.isRunning) {
      isRunningRef.current = false;
      cancelAnimationFrame(detectionCleanupRef.current);
      state.services.camera.stopCamera();
      actions.setRunning(false);
      actions.resetResults();
    } else {
      try {
        await state.services.camera.startCamera();
        actions.setRunning(true);
        actions.setAppState('analyzing');
        startDetectionLoop(state.services.detector, state.services.camera);
      } catch (error) {
        actions.setError(error.message);
      }
    }
  };

  // TODO [Advance] Fungsi untuk mengubah nada fakta yang dihasilkan

  // TODO [Skilled] Fungsi untuk menyalin fakta ke clipboard

  return (
    <div className="app-container">
      <Header modelStatus={state.modelStatus} />

      <main className="main-content">
        <CameraSection
          isRunning={state.isRunning}
          onToggleCamera={handleToggleCamera}
          services={state.services}
          modelStatus={state.modelStatus}
          error={state.error}
          currentTone={currentTone}
        />

        <InfoPanel
          appState={state.appState}
          detectionResult={state.detectionResult}
          funFactData={state.funFactData}
          error={state.error}
        />
      </main>

      <footer className="footer">
        <p>Powered by TensorFlow.js & Transformers.js</p>
      </footer>

      {state.error && (
        <div
          style={{
            position: 'fixed',
            bottom: '1rem',
            left: '50%',
            transform: 'translateX(-50%)',
            maxWidth: '380px',
            padding: '0.875rem 1rem',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: 'var(--radius-md)',
            color: '#991b1b',
            fontSize: '0.8125rem',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            zIndex: 1000,
          }}
        >
          <strong>Error:</strong> {state.error}
          <button
            onClick={() => actions.setError(null)}
            style={{
              marginLeft: 'auto',
              background: 'transparent',
              border: 'none',
              fontSize: '1.25rem',
              cursor: 'pointer',
              color: '#991b1b',
              padding: 0,
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
