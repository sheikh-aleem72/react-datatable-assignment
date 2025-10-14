import { createRoot } from 'react-dom/client'
import 'primereact/resources/primereact.min.css';                 // Core CSS
import 'primeicons/primeicons.css';   
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom';


createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
)
