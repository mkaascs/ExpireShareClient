import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Home from './pages/Home'
import Download from './pages/Download'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import Upload from './pages/Upload'

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/download/:alias" element={<Download />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/files" element={<Profile />} />
                    <Route path="/upload" element={<Upload />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    )
}
