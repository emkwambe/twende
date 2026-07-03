import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Chama from './pages/Chama';
import Biashara from './pages/Biashara';
import Kazi from './pages/Kazi';
import Linda from './pages/Linda';
import Soko from './pages/Soko';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="chama" element={<Chama />} />
        <Route path="biashara" element={<Biashara />} />
        <Route path="kazi" element={<Kazi />} />
        <Route path="linda" element={<Linda />} />
        <Route path="soko" element={<Soko />} />
      </Route>
    </Routes>
  );
}

export default App;
