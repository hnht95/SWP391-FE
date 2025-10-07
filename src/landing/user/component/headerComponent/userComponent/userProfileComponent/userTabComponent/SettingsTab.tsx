import { motion } from 'framer-motion';
import { Settings, Bell, Shield, Globe } from 'lucide-react';

const SettingsTab = () => {
  const settingsSections = [
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'Manage your notification preferences',
      icon: Bell,
      items: [
        { label: 'Email Notifications', enabled: true },
        { label: 'Push Notifications', enabled: false },
        { label: 'SMS Alerts', enabled: true },
      ]
    },
    {
      id: 'privacy',
      title: 'Privacy & Security',
      description: 'Control your privacy and security settings',
      icon: Shield,
      items: [
        { label: 'Two-factor Authentication', enabled: false },
        { label: 'Profile Visibility', enabled: true },
        { label: 'Data Collection', enabled: false },
      ]
    },
    {
      id: 'language',
      title: 'Language & Region',
      description: 'Set your preferred language and region',
      icon: Globe,
      items: [
        { label: 'English (US)', enabled: true },
        { label: 'Auto-detect timezone', enabled: true },
      ]
    }
  ];

  return (
    <div className="space-y-8">
      {/* Settings Sections */}
      {settingsSections.map((section, index) => (
        <motion.div
          key={section.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.4, ease: 'easeOut' }}
          className="space-y-4"
        >
          {/* Section Header */}
          <div className="flex items-center space-x-3">
            <section.icon className="w-6 h-6 text-gray-900" />
            <h4 className="text-xl font-bold text-gray-900">
              {section.title}
            </h4>
          </div>
          
          {/* Section Content */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg">
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                {section.description}
              </p>
              
              <div className="space-y-4">
                {section.items.map((item, itemIndex) => (
                  <div
                    key={itemIndex}
                    className="flex items-center justify-between py-2"
                  >
                    <span className="text-gray-900 font-medium">
                      {item.label}
                    </span>
                    <motion.button
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
                        item.enabled
                          ? 'bg-blue-600'
                          : 'bg-gray-300'
                      }`}
                      whileTap={{ scale: 0.95 }}
                    >
                      <motion.span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-300 ${
                          item.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                        layout
                      />
                    </motion.button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default SettingsTab
