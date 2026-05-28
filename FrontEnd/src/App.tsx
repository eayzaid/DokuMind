import { Navigate, Route, Routes } from 'react-router-dom'
import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'
import RoleMock from './pages/RoleMock'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/auth/login" replace />} />
      <Route path="/auth/login" element={<Login />} />
      <Route path="/auth/signup" element={<Signup />} />
      <Route path="/admin" element={<RoleMock />} />
      <Route path="/rh" element={<RoleMock />} />
      <Route path="/assistant" element={<RoleMock />} />
      <Route path="/worker" element={<RoleMock />} />
      <Route path="/role" element={<RoleMock />} />
      <Route path="*" element={<Navigate to="/auth/login" replace />} />
    </Routes>
  )
}

export default App
