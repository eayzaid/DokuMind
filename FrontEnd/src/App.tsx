import { Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'
import AdminLayout from './pages/admin/AdminLayout'
import UserManagement from './pages/admin/UserManagement'
import RHLayout from './pages/rh/RHLayout'
import RHUserManagement from './pages/rh/UserManagement'
import DocumentManagement from './pages/DocumentManagement'
import ChatPage from './pages/chat/ChatPage'
import AssistantLayout from './pages/assistant/AssistantLayout'
import WorkerLayout from './pages/worker/WorkerLayout'
import RoleMock from './pages/RoleMock'

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/auth/login" replace />} />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/signup" element={<Signup />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/users" replace />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="documents" element={<DocumentManagement />} />
          <Route path="chat" element={<ChatPage />} />
        </Route>
        <Route path="/rh" element={<RHLayout />}>
          <Route index element={<Navigate to="/rh/users" replace />} />
          <Route path="users" element={<RHUserManagement />} />
          <Route path="documents" element={<DocumentManagement />} />
          <Route path="chat" element={<ChatPage />} />
        </Route>
        <Route path="/assistant" element={<AssistantLayout />}>
          <Route index element={<Navigate to="/assistant/chat" replace />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="documents" element={<DocumentManagement />} />
        </Route>
        <Route path="/worker" element={<WorkerLayout />}>
          <Route index element={<Navigate to="/worker/chat" replace />} />
          <Route path="chat" element={<ChatPage />} />
        </Route>
        <Route path="/role" element={<RoleMock />} />
        <Route path="*" element={<Navigate to="/auth/login" replace />} />
      </Routes>
      <Toaster />
    </>
  )
}

export default App
