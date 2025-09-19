import { motion } from 'framer-motion'

interface UserData {
  id: string
  name: string
  email: string
  phone: string
  avatar?: string
  role: 'User' | 'Admin'
}

interface UserProfileCardProps {
  user: UserData
}

const UserProfileCard = ({ user }: UserProfileCardProps) => {
  const handleEditAvatar = () => {
    console.log('Edit avatar clicked')
  }

  const handleEditProfile = () => {
    console.log('Edit profile clicked')
  }

  return (
    <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-8'>
      <div className='flex flex-col items-center space-y-6'>
        {/* Avatar Section */}
        <div className='relative group'>
          <div className='w-[150px] h-[150px] rounded-full overflow-hidden bg-gray-200 shadow-md'>
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className='w-full h-full object-cover'
              />
            ) : (
              <div className='w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center'>
                <span className='text-white text-4xl font-bold'>
                  {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </span>
              </div>
            )}
          </div>
          
          {/* Edit Avatar Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleEditAvatar}
            className='absolute bottom-2 right-2 w-10 h-10 bg-black text-white rounded-full shadow-lg hover:bg-gray-800 transition-colors duration-300 ease-in-out flex items-center justify-center group-hover:shadow-xl'
          >
            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z' />
            </svg>
          </motion.button>
        </div>

        {/* User Info */}
        <div className='text-center space-y-2'>
          <h2 className='text-xl font-bold text-black'>{user.name}</h2>
          
          <div className='space-y-1'>
            <p className='text-gray-600 text-sm'>{user.email}</p>
            <p className='text-gray-600 text-sm'>{user.phone}</p>
          </div>

          {/* Role Badge */}
          <div className='pt-2'>
            <span className='inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
              {user.role}
            </span>
          </div>
        </div>

        {/* Edit Profile Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleEditProfile}
          className='w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all duration-300 ease-in-out shadow-md hover:shadow-lg'
        >
          Edit Profile
        </motion.button>
      </div>
    </div>
  )
}

export default UserProfileCard
