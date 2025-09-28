export interface Car {
  id: number
  name: string
  price: number
  transmission: string
  seats: number
  range: string
  image: string
  location: string
  station?: string
  type: string
  status: 'active' | 'maintenance' | 'rented' | 'inactive'
}

export type VehicleStatus = 'active' | 'maintenance' | 'rented' | 'inactive'
