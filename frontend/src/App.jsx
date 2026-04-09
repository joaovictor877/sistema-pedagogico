import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Layout from './components/Layout/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Beneficiarios from './pages/Beneficiarios'
import Cursos from './pages/Cursos'
import Turmas from './pages/Turmas'
import Presenca from './pages/Presenca'
import Instrutores from './pages/Instrutores'
import Relatorios from './pages/Relatorios'
import Certificados from './pages/Certificados'
import Configuracoes from './pages/Configuracoes'

function PrivateRoute({ children }) {
  const { token } = useAuth()
  return token ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const { token } = useAuth()
  return !token ? children : <Navigate to="/" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="beneficiarios" element={<Beneficiarios />} />
            <Route path="cursos" element={<Cursos />} />
            <Route path="turmas" element={<Turmas />} />
            <Route path="presenca" element={<Presenca />} />
            <Route path="instrutores" element={<Instrutores />} />
            <Route path="relatorios" element={<Relatorios />} />
            <Route path="certificados" element={<Certificados />} />
            <Route path="configuracoes" element={<Configuracoes />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
