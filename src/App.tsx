import React, { Suspense, lazy, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import { PlayerProvider } from './context/PlayerContext';
import AudioPlayer from './components/AudioPlayer';
import Preloader from './components/Preloader';

const Home = lazy(() => import('./pages/Home'));
const Artist = lazy(() => import('./pages/Artist'));
const PodcastPage = lazy(() => import('./pages/PodcastPage'));

function App() {
  const [loading, setLoading] = useState(true);

  return (
    <PlayerProvider>
      <Preloader visible={loading} durationMs={2400} onDone={() => setLoading(false)} />
      <Router>
        <Layout>
          <Suspense fallback={<div className="mx-auto min-h-[45vh] w-full max-w-7xl px-4 pt-28 text-sm uppercase tracking-[0.2em] text-white/50">Loading...</div>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/artist/:id" element={<Artist />} />
              <Route path="/podcast" element={<PodcastPage />} />
            </Routes>
          </Suspense>
        </Layout>
      </Router>
      <AudioPlayer />
    </PlayerProvider>
  );
}

export default App;
