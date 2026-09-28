import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { EnvProvider } from './hooks/useEnv.jsx'
import './styles/global.css'

createRoot(document.getElementById('root')).render(
  <EnvProvider>
    <App />
  </EnvProvider>,
)
