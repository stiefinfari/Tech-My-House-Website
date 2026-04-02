import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Artist from './pages/Artist';
import PodcastPage from './pages/PodcastPage';
import { PlayerProvider } from './context/PlayerContext';
import AudioPlayer from './components/AudioPlayer';
import Preloader from './components/Preloader';

function App() {
  const [loading, setLoading] = useState(true);

  return (
    <PlayerProvider>
      <Preloader visible={loading} durationMs={2400} onDone={() => setLoading(false)} />
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/artist/:id" element={<Artist />} />
            <Route path="/podcast" element={<PodcastPage />} />
          </Routes>
        </Layout>
      </Router>
      <AudioPlayer />
    </PlayerProvider>
  );
}

export default App;
