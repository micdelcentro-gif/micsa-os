import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { HardHat, TrendingUp, Zap, ShieldCheck, Database, Server } from 'lucide-react'
import { BUSINESS_RULES } from './constants'
import './App.css'

function App() {
  const [backendStatus, setBackendStatus] = useState({ new: 'loading', legacy: 'loading' })

  useEffect(() => {
    // Check main backend
    fetch('http://localhost:8000/health')
      .then(res => setBackendStatus(prev => ({ ...prev, new: res.ok ? 'online' : 'offline' })))
      .catch(() => setBackendStatus(prev => ({ ...prev, new: 'offline' })))

    // Check legacy backend
    fetch('http://localhost:3000/')
      .then(res => setBackendStatus(prev => ({ ...prev, legacy: res.ok ? 'online' : 'offline' })))
      .catch(() => setBackendStatus(prev => ({ ...prev, legacy: 'offline' })))
  }, [])

  return (
    <div className="micsa-container">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1>🚀 MICSA Digital Suite</h1>
        <p className="subtitle">Industrial Operating System 2026</p>
      </motion.header>

      <div className="status-grid">
        <StatusCard title="Backend API" status={backendStatus.new} icon={<Server size={18} />} />
        <StatusCard title="Legacy Core" status={backendStatus.legacy} icon={<Database size={18} />} />
      </div>

      <div className="bento-grid">
        <AppCard
          delay={0.1}
          icon={<HardHat size={32} />}
          title="Seguridad"
          value={`${(BUSINESS_RULES.SAFETY_MIN_PERCENT * 100).toFixed(0)}%`}
          desc="Margen mínimo de seguridad industrial"
        />
        <AppCard
          delay={0.2}
          icon={<TrendingUp size={32} />}
          title="Estratégico"
          value={`${(BUSINESS_RULES.STRATEGIC_VALUE_FEE * 100).toFixed(0)}%`}
          desc="Tasa de valor agregado estratégico"
        />
        <AppCard
          delay={0.3}
          icon={<Zap size={32} />}
          title="Administración"
          value={`$${BUSINESS_RULES.REPSE_ADMIN_FEE}`}
          desc="Cuota administrativa REPSE"
        />
        <AppCard
          delay={0.4}
          icon={<ShieldCheck size={32} />}
          title="Riesgo Máximo"
          value="CRITICAL"
          desc="Escalada de contingencia 20%"
        />
      </div>

      <motion.div
        className="footer-status"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <div className="dot pulse"></div>
        <span>Sistema Operativo MICSA v2.1.0 Totalmente Consolidado</span>
      </motion.div>
    </div>
  )
}

function StatusCard({ title, status, icon }: { title: string, status: string, icon: any }) {
  return (
    <div className={`status-pill ${status}`}>
      {icon}
      <span>{title}: <strong>{status.toUpperCase()}</strong></span>
    </div>
  )
}

function AppCard({ icon, title, value, desc, delay }: any) {
  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ delay }}
    >
      <div className="card-icon">{icon}</div>
      <div className="card-content">
        <h3>{title}</h3>
        <p className="card-value">{value}</p>
        <p className="card-desc">{desc}</p>
      </div>
    </motion.div>
  )
}

export default App
