import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Settings, Activity } from 'lucide-react'
import ProfileTab from './userTabComponent/ProfileTab'
import SettingsTab from './userTabComponent/SettingsTab'
import ActivityTab from './userTabComponent/ActivityTab'

interface UserData {
  id: string
  name: string
  email: string
  phone: string
  avatar?: string
  role: 'User' | 'Staff' | 'Admin'
}

interface UserTabsProps {
  user: UserData
}

type TabType = 'profile' | 'settings' | 'activity'

const UserTabs = ({ user }: UserTabsProps) => {
  const [activeTab, setActiveTab] = useState<TabType>('profile')

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'activity', label: 'Activity', icon: Activity }
  ] as const

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileTab user={user} />
      case 'settings':
        return <SettingsTab />
      case 'activity':
        return <ActivityTab />
      default:
        return <ProfileTab user={user} />
    }
  }

  return (
    <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
      {/* Tab Headers */}
      <div className='flex border-b border-gray-200'>
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            whileHover={{ backgroundColor: 'rgba(249, 250, 251, 1)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-4 py-4 text-sm font-medium transition-all duration-300 ease-in-out relative ${
              activeTab === tab.id
                ? 'text-white bg-black'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className='flex items-center justify-center space-x-2'>
              <tab.icon size={16} />
              <span>{tab.label}</span>
            </div>
            
            {/* Active Tab Indicator */}
            {activeTab === tab.id && (
              <motion.div
                layoutId='activeTab'
                className='absolute bottom-0 left-0 right-0 h-0.5 bg-white'
                initial={false}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
          </motion.button>
        ))}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className='p-6'
      >
        {renderTabContent()}
      </motion.div>
    </div>
  )
}

export default UserTabs
