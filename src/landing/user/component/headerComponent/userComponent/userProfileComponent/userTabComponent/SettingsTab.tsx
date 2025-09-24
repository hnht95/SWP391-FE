import { useState } from 'react'
import { motion } from 'framer-motion'
import { Moon } from 'lucide-react'

const SettingsTab = () => {
  const [darkMode, setDarkMode] = useState(false)

  const handleToggle = () => {
    setDarkMode(prev => !prev)
  }

  const Toggle = ({ isOn, onToggle }: { isOn: boolean; onToggle: () => void }) => (
    <motion.button
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ease-in-out focus:outline-none ${
        isOn ? 'bg-white border border-gray-300' : 'bg-gray-600 border border-gray-500'
      }`}
      whileTap={{ scale: 0.95 }}
    >
      <motion.span
        className={`inline-block h-4 w-4 transform rounded-full shadow transition-transform duration-300 ease-in-out ${
          isOn ? 'translate-x-6 bg-black' : 'translate-x-1 bg-white'
        }`}
        layout
      />
    </motion.button>
  )

  return (
    <div className='space-y-8'>
      {/* Appearance Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className='space-y-6'
      >
        <div className='flex items-center space-x-3'>
          <Moon className='w-6 h-6 text-black' />
          <h4 className='text-xl font-bold text-black'>
            Appearance
          </h4>
        </div>
        
        {/* Dark Mode Setting */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.4, ease: 'easeOut' }}
          whileHover={{ y: -2 }}
          className='flex items-center justify-between p-6 bg-white rounded-2xl hover:bg-gray-50 transition-all duration-300 ease-out border border-gray-200 shadow-lg hover:shadow-xl group cursor-pointer'
        >
          <div className='flex items-center space-x-4'>
            <div className='text-black group-hover:scale-110 transition-transform duration-300'>
              <Moon className='w-5 h-5' />
            </div>
            <div>
              <p className='font-semibold text-black text-lg group-hover:text-gray-700 transition-colors duration-300'>Dark Mode</p>
              <p className='text-gray-600 mt-1 leading-relaxed'>Switch between light and dark themes</p>
            </div>
          </div>
          
          <Toggle
            isOn={darkMode}
            onToggle={handleToggle}
          />
        </motion.div>
      </motion.div>
    </div>
  )
}

export default SettingsTab
