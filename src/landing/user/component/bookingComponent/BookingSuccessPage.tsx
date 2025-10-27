// pages/BookingSuccessPage.tsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getBookingById,
  getPaymentStatus,
  type Booking,
} from "../../../../service/apiBooking/API";
import {
  getVehicleById,
  type Vehicle,
} from "../../../../service/apiAdmin/apiVehicles/API";
import type { Station } from "../../../../service/apiAdmin/apiStation/API";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaCar,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaArrowLeft,
  FaDownload,
  FaWhatsapp,
  FaEnvelope,
} from "react-icons/fa";

const BookingSuccessPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string>("pending");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ✅ Calculate duration in days
  const calculateDuration = (startTime?: string, endTime?: string): number => {
    if (!startTime || !endTime) return 0;

    const start = new Date(startTime);
    const end = new Date(endTime);

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    console.log("Duration calculation:", {
      start: start.toISOString(),
      end: end.toISOString(),
      diffTime,
      diffDays,
    });

    return diffDays;
  };

  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!bookingId) {
        setError("No booking ID provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const bookingData = await getBookingById(bookingId);
        console.log("📦 Booking data:", bookingData);
        setBooking(bookingData);

        try {
          const paymentData = await getPaymentStatus(bookingId);
          console.log("💳 Payment data:", paymentData);

          const status =
            paymentData.current?.depositStatus ||
            paymentData.deposit?.status ||
            bookingData.deposit?.status ||
            "pending";

          setPaymentStatus(status);
        } catch (paymentErr) {
          console.warn(
            "Payment status fetch failed, using booking deposit status"
          );
          setPaymentStatus(bookingData.deposit?.status || "pending");
        }

        if (bookingData.vehicle) {
          try {
            const vehicleId =
              typeof bookingData.vehicle === "string"
                ? bookingData.vehicle
                : bookingData.vehicle._id;

            const vehicleData = await getVehicleById(vehicleId);
            console.log("🚗 Vehicle data:", vehicleData);
            setVehicle(vehicleData);
          } catch (vehicleErr) {
            console.warn("Vehicle fetch failed:", vehicleErr);
            if (typeof bookingData.vehicle === "object") {
              setVehicle(bookingData.vehicle as any);
            }
          }
        }
      } catch (err: any) {
        console.error("Failed to fetch booking details:", err);
        setError(err.message || "Failed to load booking details");
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingId]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      captured: {
        icon: FaCheckCircle,
        text: "Thanh Toán Thành Công",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        textColor: "text-green-800",
        iconColor: "text-green-600",
      },
      PAID: {
        icon: FaCheckCircle,
        text: "Thanh Toán Thành Công",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        textColor: "text-green-800",
        iconColor: "text-green-600",
      },
      pending: {
        icon: FaClock,
        text: "Đang Chờ Thanh Toán",
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-200",
        textColor: "text-yellow-800",
        iconColor: "text-yellow-600",
      },
      failed: {
        icon: FaTimesCircle,
        text: "Thanh Toán Thất Bại",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        textColor: "text-red-800",
        iconColor: "text-red-600",
      },
      CANCELLED: {
        icon: FaTimesCircle,
        text: "Đã Hủy Thanh Toán",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        textColor: "text-red-800",
        iconColor: "text-red-600",
      },
    };

    return (
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-black mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <FaTimesCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-600 mb-2">
              {error || "Không Tìm Thấy Booking"}
            </h2>
            <p className="text-red-500 mb-4">
              Không thể tải thông tin booking. Vui lòng thử lại.
            </p>
            <button
              onClick={() => navigate("/vehicles")}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
            >
              Về Trang Xe
            </button>
          </div>
        </div>
      </div>
    );
  }

  const statusBadge = getStatusBadge(paymentStatus);
  const StatusIcon = statusBadge.icon;
  const isSuccess = paymentStatus === "captured" || paymentStatus === "PAID";

  const station =
    vehicle && typeof vehicle.station === "object"
      ? (vehicle.station as Station)
      : null;

  // ✅ Calculate values with fallback
  const duration =
    booking.pricingSnapshot?.computedQty ||
    calculateDuration(booking.startTime, booking.endTime);

  const basePrice = booking.pricingSnapshot?.basePrice || 0;
  const depositAmount = booking.deposit?.amount || 0;
  const subtotal = basePrice * duration;
  const totalAmount = booking.amountEstimated || subtotal + depositAmount;

  console.log("Calculated values:", {
    duration,
    basePrice,
    depositAmount,
    subtotal,
    totalAmount,
    bookingData: {
      computedQty: booking.pricingSnapshot?.computedQty,
      basePrice: booking.pricingSnapshot?.basePrice,
      depositAmount: booking.deposit?.amount,
      amountEstimated: booking.amountEstimated,
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="max-w-4xl mx-auto px-4">
        {/* Success/Failure Banner */}
        <div
          className={`${statusBadge.bgColor} border ${statusBadge.borderColor} rounded-lg p-6 mb-8`}
        >
          <div className="flex items-center justify-center gap-4">
            <StatusIcon className={`${statusBadge.iconColor} text-5xl`} />
            <div className="text-center">
              <h1
                className={`text-3xl font-bold ${statusBadge.textColor} mb-2`}
              >
                {statusBadge.text}
              </h1>
              <p className={`${statusBadge.textColor} text-lg`}>
                Mã Booking:{" "}
                <span className="font-mono font-bold">{booking.bookingId}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-3">
            Chi Tiết Booking
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column - Vehicle Info */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaCar className="text-blue-600" />
                Thông Tin Xe
              </h3>

              {vehicle ? (
                <div className="space-y-4">
                  <div className="w-full h-48 bg-gray-200 rounded-lg overflow-hidden">
                    {vehicle.defaultPhotos?.exterior?.[0]?.url ? (
                      <img
                        src={vehicle.defaultPhotos.exterior[0].url}
                        alt={`${vehicle.brand} ${vehicle.model}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <FaCar className="text-6xl" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Xe:</span>
                      <span className="font-semibold text-gray-900">
                        {vehicle.brand} {vehicle.model}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Biển Số:</span>
                      <span className="font-semibold text-gray-900">
                        {vehicle.plateNumber}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Năm:</span>
                      <span className="font-semibold text-gray-900">
                        {vehicle.year}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Màu:</span>
                      <span className="font-semibold text-gray-900 capitalize">
                        {vehicle.color}
                      </span>
                    </div>

                    {station && (
                      <div className="pt-2 border-t">
                        <div className="flex items-start gap-2">
                          <FaMapMarkerAlt className="text-red-500 mt-1" />
                          <div>
                            <p className="text-xs text-gray-600 mb-1">
                              Điểm Lấy Xe
                            </p>
                            <p className="font-semibold text-gray-900">
                              {station.name}
                            </p>
                            <p className="text-xs text-gray-600">
                              {station.location.address}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">Đang tải thông tin xe...</p>
              )}
            </div>

            {/* Right Column - Booking & Payment Info */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaCalendarAlt className="text-green-600" />
                Thời Gian Thuê
              </h3>

              <div className="space-y-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-600 mb-1">Ngày Nhận Xe</p>
                  <p className="font-semibold text-gray-900">
                    {formatDate(booking.startTime)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-600 mb-1">Ngày Trả Xe</p>
                  <p className="font-semibold text-gray-900">
                    {formatDate(booking.endTime)}
                  </p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-xs text-blue-600 mb-1">Thời Gian Thuê</p>
                  <p className="font-bold text-blue-900 text-xl">
                    {duration} Ngày
                  </p>
                </div>
              </div>

              {/* Payment Summary */}
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2 border-t pt-4">
                <FaMoneyBillWave className="text-yellow-600" />
                Tổng Quan Thanh Toán
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Giá Thuê/Ngày:</span>
                  <span className="font-medium">
                    {basePrice.toLocaleString()}đ
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Số Ngày:</span>
                  <span className="font-medium">{duration} ngày</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tạm Tính:</span>
                  <span className="font-medium">
                    {subtotal.toLocaleString()}đ
                  </span>
                </div>
                <div className="flex justify-between text-blue-600">
                  <span>Cọc (5%):</span>
                  <span className="font-medium">
                    {depositAmount.toLocaleString()}đ
                  </span>
                </div>
                <hr className="border-gray-300" />
                <div className="flex justify-between items-center font-bold text-lg pt-2">
                  <span className="text-gray-900">Tổng Thanh Toán:</span>
                  <span className="text-green-600">
                    {totalAmount.toLocaleString()}đ
                  </span>
                </div>

                {/* Payment Status */}
                <div className="pt-3 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Trạng Thái:</span>
                    <span
                      className={`font-semibold px-3 py-1 rounded-full text-sm ${
                        isSuccess
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {paymentStatus === "captured" || paymentStatus === "PAID"
                        ? "ĐÃ THANH TOÁN"
                        : paymentStatus === "pending"
                        ? "CHỜ THANH TOÁN"
                        : "THẤT BẠI"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Renter Info */}
          {booking.renter && typeof booking.renter === "object" && (
            <div className="mt-8 pt-6 border-t">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Thông Tin Người Thuê
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 mb-1">Họ Tên</p>
                  <p className="font-semibold text-gray-900">
                    {booking.renter.name || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Email</p>
                  <p className="font-semibold text-gray-900">
                    {booking.renter.email || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Số Điện Thoại</p>
                  <p className="font-semibold text-gray-900">
                    {booking.renter.phone || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate("/my-bookings")}
            className="bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <FaCar />
            Booking Của Tôi
          </button>

          <button
            onClick={() => window.print()}
            className="bg-gray-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
          >
            <FaDownload />
            In Hóa Đơn
          </button>

          <button
            onClick={() => navigate("/vehicles")}
            className="bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-medium hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
          >
            <FaArrowLeft />
            Về Trang Xe
          </button>
        </div>

        {/* Contact Support */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800 text-center mb-3">
            Cần hỗ trợ về booking của bạn?
          </p>
          <div className="flex justify-center gap-4">
            <a
              href="https://wa.me/84901405385"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700"
            >
              <FaWhatsapp />
              WhatsApp
            </a>
            <a
              href="mailto:support@evr.vn"
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
            >
              <FaEnvelope />
              Email Hỗ Trợ
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccessPage;
