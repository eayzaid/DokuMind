import { Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'
import AdminLayout from './pages/admin/AdminLayout'
import SuperRHAdmin from './pages/admin/SuperRHAdmin'
import UserManagement from './pages/admin/UserManagement'
import RHLayout from './pages/rh/RHLayout'
import RHUserManagement from './pages/rh/UserManagement'
import RoleMock from './pages/RoleMock'

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/auth/login" replace />} />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/signup" element={<Signup />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<SuperRHAdmin />} />
          <Route path="users" element={<UserManagement />} />
        </Route>
        <Route path="/rh" element={<RHLayout />}>
          <Route index element={<Navigate to="/rh/users" replace />} />
          <Route path="users" element={<RHUserManagement />} />
        </Route>
        <Route path="/assistant" element={<RoleMock />} />
        <Route path="/worker" element={<RoleMock />} />
        <Route path="/role" element={<RoleMock />} />
        <Route path="*" element={<Navigate to="/auth/login" replace />} />
      </Routes>
      <Toaster />
    </>
  )
}

export default App

