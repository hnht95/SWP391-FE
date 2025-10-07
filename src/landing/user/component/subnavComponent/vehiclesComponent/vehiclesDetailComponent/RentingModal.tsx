import React, { useState, useEffect } from "react";
import {
  FaMapMarkerAlt,
  FaChevronDown,
  FaCheckCircle,
  FaCalendarAlt,
  FaClock,
} from "react-icons/fa";
import { IoIosCloseCircleOutline } from "react-icons/io";
import { carData } from "../../../../../../data/carData";

const userData = {
  name: "Michael Bui",
  phone: "09xxxx",
  email: "nhathminh2083@gmail.com",
};

interface RentingModalProps {
  isOpen: boolean;
  onClose: () => void;
  carId: number;
}

const RentingModal: React.FC<RentingModalProps> = ({
  isOpen,
  onClose,
  carId,
}) => {
  const [activeTab, setActiveTab] = useState<"day" | "month" | "year">("day");
  const [pickupDate, setPickupDate] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [dropoffDate, setDropoffDate] = useState("");
  const [dropoffTime, setDropoffTime] = useState("");
  const [months, setMonths] = useState<number>(1);
  const [years, setYears] = useState<number>(1);
  const [voucher, setVoucher] = useState("");
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  const [isDataConsent, setIsDataConsent] = useState(false);

  const car = carData.find((c) => c.id === carId);

  useEffect(() => {
    if (!pickupDate) return;

    const start = new Date(`${pickupDate}T${pickupTime || "00:00"}`);
    let end = new Date(start);

    if (activeTab === "month") {
      end.setMonth(end.getMonth() + months);
    } else if (activeTab === "year") {
      end.setFullYear(end.getFullYear() + years);
    } else {
      if (dropoffDate) {
        end = new Date(`${dropoffDate}T${dropoffTime || "00:00"}`);
      }
    }

    setDropoffDate(end.toISOString().split("T")[0]);
    setDropoffTime(end.toTimeString().slice(0, 5));
  }, [pickupDate, pickupTime, months, years, activeTab]);

  if (!isOpen || !car) return null;

  const depositAmount = 5000000;

  const calculateTotalPrice = () => {
    if (!pickupDate || !dropoffDate) return 0;
    const oneDay = 24 * 60 * 60 * 1000;
    const start = new Date(`${pickupDate}T${pickupTime || "00:00"}`).getTime();
    const end = new Date(`${dropoffDate}T${dropoffTime || "00:00"}`).getTime();
    const diffDays = Math.round(Math.abs((end - start) / oneDay));
    return diffDays * car.price;
  };

  const totalAmount = calculateTotalPrice();
  const isFormValid =
    pickupDate && dropoffDate && isTermsAccepted && isDataConsent;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-75 backdrop-filter backdrop-blur-sm p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
        >
          <IoIosCloseCircleOutline size={24} />
        </button>

        <h2 className="text-2xl font-bold mb-4">Renting Car</h2>

        <div className="grid grid-cols-7 gap-6 h-[80vh]">
          {/* Left Column */}
          <div className="col-span-5 space-y-6 overflow-y-auto pr-4">
            {/* User Info */}
            <div className="grid grid-cols-3 gap-4">
              <input
                type="text"
                value={userData.name}
                readOnly
                className="p-2 border-slate-200 rounded-lg"
              />
              <input
                type="text"
                value={userData.phone}
                readOnly
                className="p-2 border rounded-lg bg-gray-100"
              />
              <div className="flex items-center">
                <input
                  type="email"
                  value={userData.email}
                  readOnly
                  className="p-2 border rounded-lg bg-gray-100 flex-1"
                />
                <FaCheckCircle className="ml-2 text-green-500" />
              </div>
            </div>

            {/* Car Location */}
            <div>
              <label className="text-sm font-semibold text-gray-600">
                Vị trí hiện tại của xe
              </label>
              <div className="p-3 border rounded-lg bg-gray-50 flex items-center gap-2">
                <FaMapMarkerAlt className="text-gray-500" />
                <span>
                  {car.station} - {car.location}
                </span>
              </div>
            </div>

            {/* Voucher */}
            <div>
              <label className="text-sm font-semibold text-black mb-2">
                Mã Voucher
              </label>
              <input
                type="text"
                value={voucher}
                onChange={(e) => setVoucher(e.target.value)}
                placeholder="Nhập mã voucher"
                className="p-3 mt-2 border-slate-200 border-[1px] focus:outline-slate-300 rounded-lg w-full"
              />
            </div>

            {/* Rental Tabs */}
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab("day")}
                className={`px-4 py-2 ${
                  activeTab === "day"
                    ? "border-b-2 border-black font-semibold text-black-600"
                    : "text-gray-500"
                }`}
              >
                Thuê ngày
              </button>
              <button
                onClick={() => setActiveTab("month")}
                className={`px-4 py-2 ${
                  activeTab === "month"
                    ? "border-b-2 border-black font-semibold text-black-600"
                    : "text-gray-500"
                }`}
              >
                Thuê tháng
              </button>
              <button
                onClick={() => setActiveTab("year")}
                className={`px-4 py-2 ${
                  activeTab === "year"
                    ? "border-b-2 border-black font-semibold text-black-600"
                    : "text-gray-500"
                }`}
              >
                Thuê năm
              </button>
            </div>

            {/* Date/Time Form */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-600">
                  Ngày nhận xe
                </label>
                <input
                  type="date"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">
                  Giờ nhận xe
                </label>
                <input
                  type="time"
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              {activeTab === "month" && (
                <div>
                  <label className="text-sm font-semibold text-gray-600">
                    Số tháng
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={months}
                    onChange={(e) => setMonths(Number(e.target.value))}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
              )}

              {activeTab === "year" && (
                <div>
                  <label className="text-sm font-semibold text-gray-600">
                    Số năm
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={years}
                    onChange={(e) => setYears(Number(e.target.value))}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
              )}

              <div>
                <label className="text-sm font-semibold text-gray-600">
                  Ngày trả xe
                </label>
                <input
                  type="date"
                  value={dropoffDate}
                  readOnly
                  className="w-full p-2 border rounded-lg bg-gray-100"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">
                  Giờ trả xe
                </label>
                <input
                  type="time"
                  value={dropoffTime}
                  readOnly
                  className="w-full p-2 border rounded-lg bg-gray-100"
                />
              </div>
            </div>

            {/* Checkboxes */}
            <div className="space-y-2 text-sm text-gray-700 mt-4">
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={isTermsAccepted}
                  onChange={(e) => setIsTermsAccepted(e.target.checked)}
                />
                <span>
                  Tôi đồng ý với{" "}
                  <a href="#" className="text-blue-600">
                    Điều khoản thanh toán
                  </a>
                </span>
              </div>
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={isDataConsent}
                  onChange={(e) => setIsDataConsent(e.target.checked)}
                />
                <span>
                  Tôi đồng ý chia sẻ thông tin cá nhân theo{" "}
                  <a href="#" className="text-blue-600">
                    Chính sách bảo mật
                  </a>
                </span>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="col-span-2 flex flex-col space-y-6">
            <div className="bg-gray-50 rounded-lg p-4 flex items-center gap-4">
              <img
                src={car.image}
                alt={car.name}
                className="w-24 h-16 object-cover rounded-lg"
              />
              <div>
                <h3 className="font-bold">{car.name}</h3>
                <p className="text-sm text-gray-500">{car.location}</p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Cước phí niêm yết</span>
                <span>{car.price.toLocaleString("vi-VN")}đ/ngày</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tổng tiền cước thuê</span>
                <span>{totalAmount.toLocaleString("vi-VN")}đ</span>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>Tổng tiền</span>
                <span>{totalAmount.toLocaleString("vi-VN")}đ</span>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>Tiền đặt cọc</span>
                <span>{depositAmount.toLocaleString("vi-VN")}đ</span>
              </div>
            </div>

            <button
              disabled={!isFormValid}
              className={`w-full py-3 rounded-lg font-bold mt-auto ${
                isFormValid
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-green-100 text-slate-300 cursor-not-allowed"
              }`}
            >
              Thanh toán {(totalAmount + depositAmount).toLocaleString("vi-VN")}
              đ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RentingModal;
