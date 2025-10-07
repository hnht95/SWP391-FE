import { motion } from 'framer-motion'
import { Shield, User, LogIn, Car, CreditCard, CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react'

interface Activity {
  id: string
  type: 'security' | 'profile' | 'login' | 'booking' | 'payment'
  title: string
  description: string
  timestamp: string
  status: 'success' | 'warning' | 'info' | 'error'
}

const ActivityTab = () => {
  const activities: Activity[] = [
    {
      id: '1',
      type: 'security',
      title: 'Password Changed',
      description: 'You successfully changed your password',
      timestamp: '2 hours ago',
      status: 'success'
    },
    {
      id: '2',
      type: 'profile',
      title: 'Profile Updated',
      description: 'Your profile information was updated',
      timestamp: '1 day ago',
      status: 'info'
    },
    {
      id: '3',
      type: 'login',
      title: 'New Login',
      description: 'Signed in from Chrome on Windows',
      timestamp: '2 days ago',
      status: 'info'
    },
    {
      id: '4',
      type: 'booking',
      title: 'Booking Confirmed',
      description: 'Your car booking for Tesla Model S has been confirmed',
      timestamp: '3 days ago',
      status: 'success'
    },
    {
      id: '5',
      type: 'payment',
      title: 'Payment Failed',
      description: 'Payment for booking #12345 was declined',
      timestamp: '5 days ago',
      status: 'error'
    },
    {
      id: '6',
      type: 'security',
      title: 'Security Alert',
      description: 'Login attempt from unknown device was blocked',
      timestamp: '1 week ago',
      status: 'warning'
    }
  ]

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'security':
        return <Shield className='w-5 h-5' />
      case 'profile':
        return <User className='w-5 h-5' />
      case 'login':
        return <LogIn className='w-5 h-5' />
      case 'booking':
        return <Car className='w-5 h-5' />
      case 'payment':
        return <CreditCard className='w-5 h-5' />
    }
  }

  const getStatusColor = (status: Activity['status']) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-600 border-green-200'
      case 'warning':
        return 'bg-yellow-100 text-yellow-600 border-yellow-200'
      case 'info':
        return 'bg-blue-100 text-blue-600 border-blue-200'
      case 'error':
        return 'bg-red-100 text-red-600 border-red-200'
    }
  }

  const getStatusIcon = (status: Activity['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className='w-4 h-4' />
      case 'warning':
        return <AlertTriangle className='w-4 h-4' />
      case 'info':
        return <Info className='w-4 h-4' />
      case 'error':
        return <XCircle className='w-4 h-4' />
    }
  }

  return (
    <div className='space-y-8'>

      <div className='space-y-4'>
        {activities.map((activity, index) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4, ease: 'easeOut' }}
            whileHover={{ y: -2 }}
                className='flex items-start space-x-4 p-6 bg-white rounded-2xl hover:bg-gray-50 transition-all duration-300 ease-out group cursor-pointer border border-gray-200 shadow-lg hover:shadow-xl'
          >
            {/* Activity Icon */}
            <div className={`flex-shrink-0 p-3 rounded-2xl ${getStatusColor(activity.status)} group-hover:scale-110 transition-all duration-300 ease-out shadow-md`}>
              {getActivityIcon(activity.type)}
            </div>

            {/* Activity Content */}
            <div className='flex-1 min-w-0'>
              <div className='flex items-start justify-between'>
                <div className='flex-1 pr-4'>
                      <h4 className='text-lg font-semibold text-black group-hover:text-gray-700 transition-colors duration-300'>
                        {activity.title}
                      </h4>
                      <p className='text-gray-600 mt-2 leading-relaxed'>
                        {activity.description}
                      </p>
                      <div className='flex items-center mt-3 space-x-4'>
                        <p className='text-xs text-gray-500 font-medium'>
                          {activity.timestamp}
                        </p>
                      </div>
                </div>

                {/* Status Badge */}
                <div className={`flex items-center space-x-2 px-4 py-2 rounded-2xl text-sm font-medium border ${getStatusColor(activity.status)} shadow-sm`}>
                  {getStatusIcon(activity.status)}
                  <span className='capitalize'>{activity.status}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Load More */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className='text-center pt-6'
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
              className='px-8 py-4 bg-gray-50 text-black rounded-2xl font-medium hover:bg-gray-100 transition-all duration-300 ease-out border border-gray-300 shadow-lg'
        >
          Load More Activities
        </motion.button>
      </motion.div>
    </div>
  )
}

export default ActivityTab
