import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'var(--bg)' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="text-center max-w-md"
      >
        {/* Large 404 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-[8rem] font-bold leading-none select-none"
          style={{ color: 'var(--border-strong)' }}
        >
          404
        </motion.div>

        <h1
          className="text-2xl font-semibold mt-4 mb-3"
          style={{ color: 'var(--text)' }}
        >
          Page not found
        </h1>

        <p
          className="text-sm leading-relaxed mb-8"
          style={{ color: 'var(--text-muted)' }}
        >
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              color: 'var(--text-secondary)',
              border: '1px solid var(--border)',
              background: 'transparent',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--border-strong)'
              e.currentTarget.style.color = 'var(--text)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border)'
              e.currentTarget.style.color = 'var(--text-secondary)'
            }}
          >
            <ArrowLeft size={14} />
            Go back
          </button>

          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: 'var(--accent)',
              color: '#fff',
              border: '1px solid transparent',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'var(--accent-hover)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'var(--accent)'
            }}
          >
            <Home size={14} />
            Go home
          </button>
        </div>
      </motion.div>
    </div>
  )
}
