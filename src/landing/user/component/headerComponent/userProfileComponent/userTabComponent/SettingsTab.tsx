import { useState } from 'react'
import { motion } from 'framer-motion'
import { Moon, Mail, Smartphone, Shield, Star, RotateCcw } from 'lucide-react'

const SettingsTab = () => {
  const [settings, setSettings] = useState({
    darkMode: false,
    emailNotifications: true,
    pushNotifications: false,
    securityAlerts: true
  })

  const handleToggle = (setting: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }))
  }

  const settingsSections = [
    {
      title: 'Appearance',
      settings: [
        {
          key: 'darkMode' as keyof typeof settings,
          label: 'Dark Mode',
          description: 'Switch between light and dark themes',
          icon: <Moon className='w-5 h-5' />
        }
      ]
    },
    {
      title: 'Notifications',
      settings: [
        {
          key: 'emailNotifications' as keyof typeof settings,
          label: 'Email Notifications',
          description: 'Receive notifications via email',
          icon: <Mail className='w-5 h-5' />
        },
        {
          key: 'pushNotifications' as keyof typeof settings,
          label: 'Push Notifications',
          description: 'Receive push notifications on your device',
          icon: <Smartphone className='w-5 h-5' />
        },
        {
          key: 'securityAlerts' as keyof typeof settings,
          label: 'Security Alerts',
          description: 'Get notified about important security events',
          icon: <Shield className='w-5 h-5' />
        }
      ]
    }
  ]

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

      {settingsSections.map((section, sectionIndex) => (
        <motion.div
          key={section.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: sectionIndex * 0.1, duration: 0.4, ease: 'easeOut' }}
          className='space-y-6'
        >
          <div className='flex items-center space-x-3'>
            {section.title === 'Appearance' && <Moon className='w-6 h-6 text-blue-400' />}
            {section.title === 'Notifications' && <Mail className='w-6 h-6 text-green-400' />}
            <h4 className='text-xl font-bold text-white'>
              {section.title}
            </h4>
          </div>
          
          <div className='space-y-4'>
            {section.settings.map((setting, settingIndex) => (
              <motion.div
                key={setting.key}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ 
                  delay: (sectionIndex * 0.1) + (settingIndex * 0.05), 
                  duration: 0.4, 
                  ease: 'easeOut' 
                }}
                whileHover={{ y: -2 }}
                className='flex items-center justify-between p-6 bg-white/5 backdrop-blur-sm rounded-2xl hover:bg-white/10 transition-all duration-300 ease-out border border-white/10 shadow-lg hover:shadow-xl group cursor-pointer'
              >
                <div className='flex items-center space-x-4'>
                  <div className='text-white group-hover:scale-110 transition-transform duration-300'>
                    {setting.icon}
                  </div>
                  <div>
                    <p className='font-semibold text-white text-lg group-hover:text-gray-200 transition-colors duration-300'>{setting.label}</p>
                    <p className='text-gray-300 mt-1 leading-relaxed'>{setting.description}</p>
                  </div>
                </div>
                
                <Toggle
                  isOn={settings[setting.key]}
                  onToggle={() => handleToggle(setting.key)}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      ))}

      {/* Additional Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4, ease: 'easeOut' }}
        className='p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl border border-white/20 shadow-lg'
      >
        <div className='flex items-center space-x-3 mb-4'>
          <Star className='w-6 h-6 text-yellow-400' />
          <h4 className='text-xl font-bold text-white'>Premium Features</h4>
        </div>
        <p className='text-gray-300 mb-4'>Unlock advanced features and enhanced security with ZaMi Premium.</p>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className='px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg'
        >
          Upgrade to Premium
        </motion.button>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4, ease: 'easeOut' }}
        className='flex flex-col sm:flex-row gap-4'
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className='flex-1 py-4 bg-white text-black rounded-2xl font-medium hover:bg-gray-100 transition-all duration-300 ease-out shadow-lg flex items-center justify-center space-x-2'
        >
          <span>Save Changes</span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className='flex-1 py-4 bg-white/10 text-white rounded-2xl font-medium hover:bg-white/20 transition-all duration-300 ease-out border border-white/20 shadow-lg flex items-center justify-center space-x-2'
        >
          <RotateCcw className='w-4 h-4' />
          <span>Reset to Default</span>
        </motion.button>
      </motion.div>
    </div>
  )
}

export default SettingsTab
