import { motion } from 'framer-motion'
import { Calendar, MapPin, CreditCard, Clock } from 'lucide-react'

interface Booking {
  id: string
  carName: string
  carImage: string
  startDate: string
  endDate: string
  pickupLocation: string
  returnLocation: string
  totalCost: number
  status: 'completed' | 'ongoing' | 'cancelled' | 'upcoming'
  duration: string
}

const BookingHistoryTab = () => {
  const bookings: Booking[] = [
    {
      id: 'BK001',
      carName: 'Tesla Model S',
      carImage: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=80&h=60&fit=crop',
      startDate: '2024-01-15',
      endDate: '2024-01-18',
      pickupLocation: 'Ho Chi Minh City Airport',
      returnLocation: 'District 1, HCM',
      totalCost: 1200000,
      status: 'completed',
      duration: '3 days'
    },
    {
      id: 'BK002',
      carName: 'BMW X5',
      carImage: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=80&h=60&fit=crop',
      startDate: '2024-02-01',
      endDate: '2024-02-05',
      pickupLocation: 'District 3, HCM',
      returnLocation: 'Tan Son Nhat Airport',
      totalCost: 2000000,
      status: 'ongoing',
      duration: '4 days'
    },
    {
      id: 'BK003',
      carName: 'Mercedes C-Class',
      carImage: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=80&h=60&fit=crop',
      startDate: '2024-01-28',
      endDate: '2024-01-30',
      pickupLocation: 'District 7, HCM',
      returnLocation: 'District 2, HCM',
      totalCost: 800000,
      status: 'cancelled',
      duration: '2 days'
    },
    {
      id: 'BK004',
      carName: 'Audi A6',
      carImage: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=80&h=60&fit=crop',
      startDate: '2024-02-15',
      endDate: '2024-02-20',
      pickupLocation: 'District 1, HCM',
      returnLocation: 'Vung Tau Beach',
      totalCost: 2500000,
      status: 'upcoming',
      duration: '5 days'
    },
    {
      id: 'BK005',
      carName: 'VinFast VF8',
      carImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=80&h=60&fit=crop',
      startDate: '2024-01-05',
      endDate: '2024-01-07',
      pickupLocation: 'Thu Duc City',
      returnLocation: 'Ben Thanh Market',
      totalCost: 600000,
      status: 'completed',
      duration: '2 days'
    }
  ]

  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'ongoing':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'upcoming':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    }
  }

  const getStatusIcon = (status: Booking['status']) => {
    switch (status) {
      case 'completed':
        return <div className='w-2 h-2 bg-green-500 rounded-full'></div>
      case 'ongoing':
        return <div className='w-2 h-2 bg-blue-500 rounded-full animate-pulse'></div>
      case 'cancelled':
        return <div className='w-2 h-2 bg-red-500 rounded-full'></div>
      case 'upcoming':
        return <div className='w-2 h-2 bg-yellow-500 rounded-full'></div>
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  return (
    <div className='space-y-6'>

      <div className='space-y-4'>
        {bookings.map((booking, index) => (
          <motion.div
            key={booking.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4, ease: 'easeOut' }}
            whileHover={{ y: -2 }}
            className='bg-white rounded-2xl border border-gray-200 p-6 hover:bg-gray-50 transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl group cursor-pointer'
          >
            <div className='flex items-start space-x-4'>
              {/* Car Image */}
              <div className='flex-shrink-0'>
                <img
                  src={booking.carImage}
                  alt={booking.carName}
                  className='w-16 h-12 object-cover rounded-xl shadow-md group-hover:scale-105 transition-transform duration-300'
                />
              </div>

              {/* Booking Info */}
              <div className='flex-1 space-y-3'>
                {/* Header */}
                <div className='flex items-start justify-between'>
                  <div>
                    <h4 className='text-lg font-semibold text-black group-hover:text-gray-700 transition-colors duration-300'>
                      {booking.carName}
                    </h4>
                    <p className='text-gray-600 text-sm'>Booking ID: {booking.id}</p>
                  </div>
                  
                  {/* Status Badge */}
                  <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
                    {getStatusIcon(booking.status)}
                    <span className='capitalize'>{booking.status}</span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
                  {/* Duration */}
                  <div className='flex items-center space-x-2'>
                    <Calendar className='w-4 h-4 text-gray-600' />
                    <div>
                      <p className='text-xs text-gray-500 font-medium'>Duration</p>
                      <p className='text-sm font-bold text-black'>{booking.duration}</p>
                    </div>
                  </div>

                  {/* Pickup */}
                  <div className='flex items-center space-x-2'>
                    <MapPin className='w-4 h-4 text-gray-600' />
                    <div>
                      <p className='text-xs text-gray-500 font-medium'>Pickup</p>
                      <p className='text-sm font-bold text-black truncate'>{booking.pickupLocation}</p>
                    </div>
                  </div>

                  {/* Cost */}
                  <div className='flex items-center space-x-2'>
                    <CreditCard className='w-4 h-4 text-gray-600' />
                    <div>
                      <p className='text-xs text-gray-500 font-medium'>Total Cost</p>
                      <p className='text-sm font-bold text-black'>{formatCurrency(booking.totalCost)}</p>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className='flex items-center space-x-2'>
                    <Clock className='w-4 h-4 text-gray-600' />
                    <div>
                      <p className='text-xs text-gray-500 font-medium'>Period</p>
                      <p className='text-sm font-bold text-black'>{new Date(booking.startDate).toLocaleDateString('vi-VN')}</p>
                    </div>
                  </div>
                </div>

                {/* Return Location */}
                <div className='pt-2 border-t border-gray-200'>
                  <div className='flex items-center justify-between text-sm'>
                    <span className='text-black font-semibold'>Return to: {booking.returnLocation}</span>
                    {booking.status === 'upcoming' && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className='px-3 py-1 bg-gray-50 text-black rounded-lg text-xs hover:bg-gray-100 transition-colors duration-300'
                      >
                        View Details
                      </motion.button>
                    )}
                  </div>
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
        transition={{ delay: 0.5, duration: 0.3 }}
        className='text-center pt-4'
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className='px-6 py-3 bg-gray-50 text-black rounded-2xl font-medium hover:bg-gray-100 transition-all duration-300 ease-in-out border border-gray-300 shadow-lg'
        >
          Load More Bookings
        </motion.button>
      </motion.div>
    </div>
  )
}

export default BookingHistoryTab
