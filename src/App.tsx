import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import Home from './pages/Home';
import Chama from './pages/Chama';
import Biashara from './pages/Biashara';
import Kazi from './pages/Kazi';
import Linda from './pages/Linda';
import Login from './pages/Login';
import Register from './pages/Register';
import Soko from './pages/Soko';
import TrustScore from './pages/TrustScore';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<Home />} />
        <Route path="chama" element={<Chama />} />
        <Route path="biashara" element={<Biashara />} />
        <Route path="kazi" element={<Kazi />} />
        <Route path="linda" element={<Linda />} />
        <Route path="soko/*" element={<Soko />} />
        <Route path="trust/score" element={<TrustScore />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
