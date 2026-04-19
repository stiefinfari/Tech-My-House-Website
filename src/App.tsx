import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import { PlayerProvider } from './context/PlayerContext';
import AudioPlayer from './components/AudioPlayer';

const Home = lazy(() => import('./pages/Home'));
const Artist = lazy(() => import('./pages/Artist'));
const PodcastPage = lazy(() => import('./pages/PodcastPage'));

function App() {
  return (
    <PlayerProvider>
      <Router>
        <Layout>
          <Suspense fallback={<div className="mx-auto min-h-[45vh] w-full max-w-7xl px-4 pt-28 text-sm uppercase tracking-[0.2em] text-white/50">Loading...</div>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/artist/:id" element={<Artist />} />
              <Route path="/podcast" element={<PodcastPage />} />
            </Routes>
          </Suspense>
          <AudioPlayer />
        </Layout>
      </Router>
    </PlayerProvider>
  );
}

export default App;
