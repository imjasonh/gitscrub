import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Home from './pages/Home';
import Repository from './pages/Repository';
import './App.css';

function App() {
  // Get base URL from Vite's base config
  const basename = import.meta.env.BASE_URL;
  
  return (
    <AuthProvider>
      <BrowserRouter basename={basename}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="/:owner/:repo" element={<Repository />} />
            <Route path="/:owner/:repo/tree/:ref/*" element={<Repository />} />
            <Route path="/:owner/:repo/blob/:ref/*" element={<Repository />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;