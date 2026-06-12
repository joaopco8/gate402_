'use client'
import { motion } from 'framer-motion'

interface ElasticSwitchProps {
  isOn: boolean
  onToggle: () => void
}

export function ElasticSwitch({ isOn, onToggle }: ElasticSwitchProps) {
  return (
    <button
      onClick={onToggle}
      className={`relative h-7 w-14 rounded-full p-1 transition-colors ${
        isOn ? 'bg-[#7AF279]' : 'bg-gray-600'
      }`}
    >
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 700, damping: 30 }}
        className={`h-5 w-5 rounded-full bg-white shadow-md ${isOn ? 'ml-auto' : ''}`}
      />
    </button>
  )
}
