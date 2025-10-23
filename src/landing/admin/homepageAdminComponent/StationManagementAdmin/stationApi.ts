// // Mock API Service - No real API calls, just mock data for testing
// import type {
//   StationListResponse,
//   CreateStationPayload,
//   Station,
// } from './types';

// // Mock data - Sample station list
// let mockStations: Station[] = [
//   {
//     id: '1',
//     name: 'District 1 Station',
//     code: 'STA001',
//     location: {
//       address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
//       latitude: 10.7769,
//       longitude: 106.7009,
//     },
//     note: 'Gần bến Bạch Đằng',
//     isActive: true,
//     createdAt: '2025-01-15T10:30:00Z',
//     vehicleCount: 25,
//     availableCount: 20,
//     maintenanceCount: 5,
//   },
//   {
//     id: '2',
//     name: 'District 7 Station',
//     code: 'STA002',
//     location: {
//       address: '456 Phú Mỹ Hưng, Quận 7, TP.HCM',
//       latitude: 10.7295,
//       longitude: 106.7194,
//     },
//     note: 'Khu dân cư Phú Mỹ Hưng',
//     isActive: true,
//     createdAt: '2025-01-20T14:15:00Z',
//     vehicleCount: 18,
//     availableCount: 15,
//     maintenanceCount: 3,
//   },
//   {
//     id: '3',
//     name: 'Tan Binh Station',
//     code: 'STA003',
//     location: {
//       address: '789 Cộng Hòa, Quận Tân Bình, TP.HCM',
//       latitude: 10.8006,
//       longitude: 106.6532,
//     },
//     note: 'Gần sân bay Tân Sơn Nhất',
//     isActive: false,
//     createdAt: '2025-02-01T09:00:00Z',
//     vehicleCount: 12,
//     availableCount: 5,
//     maintenanceCount: 7,
//   },
//   {
//     id: '4',
//     name: 'Thu Duc Station',
//     code: 'STA004',
//     location: {
//       address: '321 Võ Văn Ngân, TP. Thủ Đức, TP.HCM',
//       latitude: 10.8509,
//       longitude: 106.7717,
//     },
//     note: 'Khu công nghệ cao',
//     isActive: true,
//     createdAt: '2025-02-10T11:45:00Z',
//     vehicleCount: 30,
//     availableCount: 25,
//     maintenanceCount: 5,
//   },
//   {
//     id: '5',
//     name: 'Binh Thanh Station',
//     code: 'STA005',
//     location: {
//       address: '555 Điện Biên Phủ, Quận Bình Thạnh, TP.HCM',
//       latitude: 10.8025,
//       longitude: 106.7111,
//     },
//     note: 'Near Mien Dong Bus Station',
//     isActive: true,
//     createdAt: '2025-02-15T08:30:00Z',
//     vehicleCount: 20,
//     availableCount: 18,
//     maintenanceCount: 2,
//   },
// ];

// // Helper: Simulate async delay
// const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// /**
//  * Get stations list with pagination and filters (MOCK)
//  */
// export const getStations = async (
//   page: number = 1,
//   limit: number = 20,
//   filters?: { search?: string; status?: string }
// ): Promise<StationListResponse> => {
//   // Simulate API delay
//   await delay(500);

//   let filtered = [...mockStations];

//   // Apply search filter
//   if (filters?.search) {
//     const searchLower = filters.search.toLowerCase();
//     filtered = filtered.filter(
//       (s) =>
//         s.name.toLowerCase().includes(searchLower) ||
//         s.code.toLowerCase().includes(searchLower) ||
//         s.location.address.toLowerCase().includes(searchLower)
//     );
//   }

//   // Apply status filter
//   if (filters?.status && filters.status !== 'all') {
//     filtered = filtered.filter((s) =>
//       filters.status === 'active' ? s.isActive : !s.isActive
//     );
//   }

//   // Calculate pagination
//   const total = filtered.length;
//   const totalPages = Math.ceil(total / limit);
//   const start = (page - 1) * limit;
//   const end = start + limit;
//   const items = filtered.slice(start, end);

//   return {
//     data: {
//       items,
//       total,
//       page,
//       limit,
//       totalPages,
//     },
//     message: 'Success',
//     status: 200,
//   };
// };

// /**
//  * Create new station (MOCK)
//  */
// export const createStation = async (
//   payload: CreateStationPayload
// ): Promise<{ data: Station; message: string }> => {
//   // Simulate API delay
//   await delay(800);

//   // Check if code exists
//   if (mockStations.some((s) => s.code === payload.code)) {
//     throw new Error(`Station code "${payload.code}" already exists`);
//   }

//   // Create new station
//   const newStation: Station = {
//     id: String(mockStations.length + 1),
//     name: payload.name,
//     code: payload.code,
//     location: payload.location,
//     note: payload.note || '',
//     isActive: payload.isActive,
//     createdAt: new Date().toISOString(),
//     vehicleCount: 0,
//     availableCount: 0,
//     maintenanceCount: 0,
//   };

//   mockStations.push(newStation);

//   return {
//     data: newStation,
//     message: 'Station added successfully',
//   };
// };

// /**
//  * Update existing station (MOCK)
//  */
// export const updateStation = async (
//   id: string,
//   payload: Partial<CreateStationPayload>
// ): Promise<{ data: Station; message: string }> => {
//   // Simulate API delay
//   await delay(800);

//   const index = mockStations.findIndex((s) => s.id === id);
//   if (index === -1) {
//     throw new Error('Station not found');
//   }

//   // Update station
//   const updated: Station = {
//     ...mockStations[index],
//     ...payload,
//     location: payload.location || mockStations[index].location,
//   };

//   mockStations[index] = updated;

//   return {
//     data: updated,
//     message: 'Cập nhật trạm thành công',
//   };
// };

// /**
//  * Delete station (MOCK)
//  */
// export const deleteStation = async (id: string): Promise<{ message: string }> => {
//   // Simulate API delay
//   await delay(500);

//   const index = mockStations.findIndex((s) => s.id === id);
//   if (index === -1) {
//     throw new Error('Station not found');
//   }

//   mockStations.splice(index, 1);

//   return {
//     message: 'Station deleted successfully',
//   };
// };
