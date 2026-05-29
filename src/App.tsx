import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AdminPortal from './components/admin/AdminPortal'
import HantavirusPortal from './components/HantavirusPortal'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HantavirusPortal />} />
        <Route path="/admin" element={<AdminPortal />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
