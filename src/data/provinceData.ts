/**
 * Vietnam Provinces Data
 * Complete list of 63 provinces and cities in Vietnam with coordinates
 * Source: Official Vietnam administrative divisions
 */

export interface Province {
  code: string;
  name: string;
  nameEn: string;
  region: string;
  lat: number;
  lng: number;
  zoom: number; // Recommended zoom level for map
}

export const VIETNAM_PROVINCES: Province[] = [
  // Northern Region
  {
    code: "01",
    name: "Hà Nội",
    nameEn: "Hanoi",
    region: "Northern",
    lat: 21.0285,
    lng: 105.8542,
    zoom: 11,
  },
  {
    code: "02",
    name: "Hà Giang",
    nameEn: "Ha Giang",
    region: "Northern",
    lat: 22.8026,
    lng: 104.9784,
    zoom: 10,
  },
  {
    code: "04",
    name: "Cao Bằng",
    nameEn: "Cao Bang",
    region: "Northern",
    lat: 22.6667,
    lng: 106.2525,
    zoom: 10,
  },
  {
    code: "06",
    name: "Bắc Kạn",
    nameEn: "Bac Kan",
    region: "Northern",
    lat: 22.1471,
    lng: 105.8348,
    zoom: 10,
  },
  {
    code: "08",
    name: "Tuyên Quang",
    nameEn: "Tuyen Quang",
    region: "Northern",
    lat: 21.8234,
    lng: 105.2181,
    zoom: 10,
  },
  {
    code: "10",
    name: "Lào Cai",
    nameEn: "Lao Cai",
    region: "Northern",
    lat: 22.4856,
    lng: 103.9707,
    zoom: 10,
  },
  {
    code: "11",
    name: "Điện Biên",
    nameEn: "Dien Bien",
    region: "Northern",
    lat: 21.3871,
    lng: 103.0168,
    zoom: 10,
  },
  {
    code: "12",
    name: "Lai Châu",
    nameEn: "Lai Chau",
    region: "Northern",
    lat: 22.3864,
    lng: 103.4702,
    zoom: 10,
  },
  {
    code: "14",
    name: "Sơn La",
    nameEn: "Son La",
    region: "Northern",
    lat: 21.3256,
    lng: 103.9188,
    zoom: 10,
  },
  {
    code: "15",
    name: "Yên Bái",
    nameEn: "Yen Bai",
    region: "Northern",
    lat: 21.7168,
    lng: 104.8986,
    zoom: 10,
  },
  {
    code: "17",
    name: "Hòa Bình",
    nameEn: "Hoa Binh",
    region: "Northern",
    lat: 20.8136,
    lng: 105.3388,
    zoom: 10,
  },
  {
    code: "19",
    name: "Thái Nguyên",
    nameEn: "Thai Nguyen",
    region: "Northern",
    lat: 21.5671,
    lng: 105.8252,
    zoom: 10,
  },
  {
    code: "20",
    name: "Lạng Sơn",
    nameEn: "Lang Son",
    region: "Northern",
    lat: 21.8537,
    lng: 106.7619,
    zoom: 10,
  },
  {
    code: "22",
    name: "Quảng Ninh",
    nameEn: "Quang Ninh",
    region: "Northern",
    lat: 21.0064,
    lng: 107.2925,
    zoom: 10,
  },
  {
    code: "24",
    name: "Bắc Giang",
    nameEn: "Bac Giang",
    region: "Northern",
    lat: 21.2819,
    lng: 106.1968,
    zoom: 10,
  },
  {
    code: "25",
    name: "Phú Thọ",
    nameEn: "Phu Tho",
    region: "Northern",
    lat: 21.268,
    lng: 105.2045,
    zoom: 10,
  },
  {
    code: "26",
    name: "Vĩnh Phúc",
    nameEn: "Vinh Phuc",
    region: "Northern",
    lat: 21.3609,
    lng: 105.5474,
    zoom: 10,
  },
  {
    code: "27",
    name: "Bắc Ninh",
    nameEn: "Bac Ninh",
    region: "Northern",
    lat: 21.1861,
    lng: 106.0763,
    zoom: 11,
  },
  {
    code: "30",
    name: "Hải Dương",
    nameEn: "Hai Duong",
    region: "Northern",
    lat: 20.9373,
    lng: 106.3145,
    zoom: 10,
  },
  {
    code: "31",
    name: "Hải Phòng",
    nameEn: "Hai Phong",
    region: "Northern",
    lat: 20.8449,
    lng: 106.6881,
    zoom: 11,
  },
  {
    code: "33",
    name: "Hưng Yên",
    nameEn: "Hung Yen",
    region: "Northern",
    lat: 20.6464,
    lng: 106.0511,
    zoom: 10,
  },
  {
    code: "34",
    name: "Thái Bình",
    nameEn: "Thai Binh",
    region: "Northern",
    lat: 20.4464,
    lng: 106.3365,
    zoom: 10,
  },
  {
    code: "35",
    name: "Hà Nam",
    nameEn: "Ha Nam",
    region: "Northern",
    lat: 20.5836,
    lng: 105.923,
    zoom: 10,
  },
  {
    code: "36",
    name: "Nam Định",
    nameEn: "Nam Dinh",
    region: "Northern",
    lat: 20.4388,
    lng: 106.1621,
    zoom: 10,
  },
  {
    code: "37",
    name: "Ninh Bình",
    nameEn: "Ninh Binh",
    region: "Northern",
    lat: 20.2506,
    lng: 105.9745,
    zoom: 10,
  },

  // Central Region
  {
    code: "38",
    name: "Thanh Hóa",
    nameEn: "Thanh Hoa",
    region: "Central",
    lat: 19.8067,
    lng: 105.7851,
    zoom: 10,
  },
  {
    code: "40",
    name: "Nghệ An",
    nameEn: "Nghe An",
    region: "Central",
    lat: 18.6791,
    lng: 105.6806,
    zoom: 9,
  },
  {
    code: "42",
    name: "Hà Tĩnh",
    nameEn: "Ha Tinh",
    region: "Central",
    lat: 18.3559,
    lng: 105.9069,
    zoom: 10,
  },
  {
    code: "44",
    name: "Quảng Bình",
    nameEn: "Quang Binh",
    region: "Central",
    lat: 17.4676,
    lng: 106.597,
    zoom: 10,
  },
  {
    code: "45",
    name: "Quảng Trị",
    nameEn: "Quang Tri",
    region: "Central",
    lat: 16.7474,
    lng: 107.1857,
    zoom: 10,
  },
  {
    code: "46",
    name: "Thừa Thiên Huế",
    nameEn: "Thua Thien Hue",
    region: "Central",
    lat: 16.4637,
    lng: 107.5909,
    zoom: 10,
  },
  {
    code: "48",
    name: "Đà Nẵng",
    nameEn: "Da Nang",
    region: "Central",
    lat: 16.0544,
    lng: 108.2022,
    zoom: 12,
  },
  {
    code: "49",
    name: "Quảng Nam",
    nameEn: "Quang Nam",
    region: "Central",
    lat: 15.5394,
    lng: 108.019,
    zoom: 10,
  },
  {
    code: "51",
    name: "Quảng Ngãi",
    nameEn: "Quang Ngai",
    region: "Central",
    lat: 15.1214,
    lng: 108.8044,
    zoom: 10,
  },
  {
    code: "52",
    name: "Bình Định",
    nameEn: "Binh Dinh",
    region: "Central",
    lat: 13.7726,
    lng: 109.2196,
    zoom: 10,
  },
  {
    code: "54",
    name: "Phú Yên",
    nameEn: "Phu Yen",
    region: "Central",
    lat: 13.0881,
    lng: 109.0929,
    zoom: 10,
  },
  {
    code: "56",
    name: "Khánh Hòa",
    nameEn: "Khanh Hoa",
    region: "Central",
    lat: 12.2585,
    lng: 109.0526,
    zoom: 10,
  },
  {
    code: "58",
    name: "Ninh Thuận",
    nameEn: "Ninh Thuan",
    region: "Central",
    lat: 11.6738,
    lng: 108.8629,
    zoom: 10,
  },
  {
    code: "60",
    name: "Bình Thuận",
    nameEn: "Binh Thuan",
    region: "Central",
    lat: 10.9273,
    lng: 108.1015,
    zoom: 10,
  },

  // Central Highlands
  {
    code: "62",
    name: "Kon Tum",
    nameEn: "Kon Tum",
    region: "Highlands",
    lat: 14.3497,
    lng: 108.0005,
    zoom: 10,
  },
  {
    code: "64",
    name: "Gia Lai",
    nameEn: "Gia Lai",
    region: "Highlands",
    lat: 13.9832,
    lng: 108.0009,
    zoom: 10,
  },
  {
    code: "66",
    name: "Đắk Lắk",
    nameEn: "Dak Lak",
    region: "Highlands",
    lat: 12.7104,
    lng: 108.2378,
    zoom: 10,
  },
  {
    code: "67",
    name: "Đắk Nông",
    nameEn: "Dak Nong",
    region: "Highlands",
    lat: 12.2646,
    lng: 107.609,
    zoom: 10,
  },
  {
    code: "68",
    name: "Lâm Đồng",
    nameEn: "Lam Dong",
    region: "Highlands",
    lat: 11.5753,
    lng: 108.1429,
    zoom: 10,
  },

  // Southern Region
  {
    code: "70",
    name: "Bình Phước",
    nameEn: "Binh Phuoc",
    region: "Southern",
    lat: 11.7511,
    lng: 106.7234,
    zoom: 10,
  },
  {
    code: "72",
    name: "Tây Ninh",
    nameEn: "Tay Ninh",
    region: "Southern",
    lat: 11.3351,
    lng: 106.1098,
    zoom: 10,
  },
  {
    code: "74",
    name: "Bình Dương",
    nameEn: "Binh Duong",
    region: "Southern",
    lat: 11.3254,
    lng: 106.477,
    zoom: 11,
  },
  {
    code: "75",
    name: "Đồng Nai",
    nameEn: "Dong Nai",
    region: "Southern",
    lat: 10.9523,
    lng: 107.1667,
    zoom: 10,
  },
  {
    code: "77",
    name: "Bà Rịa - Vũng Tàu",
    nameEn: "Ba Ria - Vung Tau",
    region: "Southern",
    lat: 10.5417,
    lng: 107.2429,
    zoom: 10,
  },
  {
    code: "79",
    name: "Hồ Chí Minh",
    nameEn: "Ho Chi Minh City",
    region: "Southern",
    lat: 10.8231,
    lng: 106.6297,
    zoom: 11,
  },
  {
    code: "80",
    name: "Long An",
    nameEn: "Long An",
    region: "Southern",
    lat: 10.695,
    lng: 106.2431,
    zoom: 10,
  },
  {
    code: "82",
    name: "Tiền Giang",
    nameEn: "Tien Giang",
    region: "Southern",
    lat: 10.4493,
    lng: 106.3421,
    zoom: 10,
  },
  {
    code: "83",
    name: "Bến Tre",
    nameEn: "Ben Tre",
    region: "Southern",
    lat: 10.2433,
    lng: 106.3757,
    zoom: 10,
  },
  {
    code: "84",
    name: "Trà Vinh",
    nameEn: "Tra Vinh",
    region: "Southern",
    lat: 9.8124,
    lng: 106.2992,
    zoom: 10,
  },
  {
    code: "86",
    name: "Vĩnh Long",
    nameEn: "Vinh Long",
    region: "Southern",
    lat: 10.2397,
    lng: 105.9571,
    zoom: 10,
  },
  {
    code: "87",
    name: "Đồng Tháp",
    nameEn: "Dong Thap",
    region: "Southern",
    lat: 10.4938,
    lng: 105.6881,
    zoom: 10,
  },
  {
    code: "89",
    name: "An Giang",
    nameEn: "An Giang",
    region: "Southern",
    lat: 10.5215,
    lng: 105.1258,
    zoom: 10,
  },
  {
    code: "91",
    name: "Kiên Giang",
    nameEn: "Kien Giang",
    region: "Southern",
    lat: 10.0125,
    lng: 105.0808,
    zoom: 9,
  },
  {
    code: "92",
    name: "Cần Thơ",
    nameEn: "Can Tho",
    region: "Southern",
    lat: 10.0452,
    lng: 105.7469,
    zoom: 11,
  },
  {
    code: "93",
    name: "Hậu Giang",
    nameEn: "Hau Giang",
    region: "Southern",
    lat: 9.7577,
    lng: 105.6412,
    zoom: 10,
  },
  {
    code: "94",
    name: "Sóc Trăng",
    nameEn: "Soc Trang",
    region: "Southern",
    lat: 9.6036,
    lng: 105.974,
    zoom: 10,
  },
  {
    code: "95",
    name: "Bạc Liêu",
    nameEn: "Bac Lieu",
    region: "Southern",
    lat: 9.2515,
    lng: 105.7244,
    zoom: 10,
  },
  {
    code: "96",
    name: "Cà Mau",
    nameEn: "Ca Mau",
    region: "Southern",
    lat: 9.1527,
    lng: 105.196,
    zoom: 10,
  },
];

/**
 * Get province names only (for simple dropdowns)
 */
export const getProvinceNames = (): string[] => {
  return VIETNAM_PROVINCES.map((p) => p.name);
};

/**
 * Get provinces by region
 */
export const getProvincesByRegion = (region: string): Province[] => {
  return VIETNAM_PROVINCES.filter((p) => p.region === region);
};

/**
 * Find province by name
 */
export const findProvinceByName = (name: string): Province | undefined => {
  return VIETNAM_PROVINCES.find(
    (p) => p.name.toLowerCase() === name.toLowerCase()
  );
};

/**
 * Get province coordinate by name (for map zoom)
 */
export const getProvinceCoordinate = (
  provinceName: string
): Province | null => {
  return findProvinceByName(provinceName) || null;
};

/**
 * All regions
 */
export const REGIONS = ["Northern", "Central", "Highlands", "Southern"];
