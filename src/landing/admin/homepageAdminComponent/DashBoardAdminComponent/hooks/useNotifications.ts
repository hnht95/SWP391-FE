import { useState, useEffect, useCallback, useMemo } from "react";
import { getMaintenanceRequestsPaginated } from "../../../../../service/apiAdmin/apiVehicles/API";
import { getRenters } from "../../../../../service/apiAdmin/apiListUser/API";
import { getAllDamageReports } from "../../../../../service/apiAdmin/apiBooking/API";
import type { RawApiUser } from "../../../../../types/userTypes";
import type { Notification } from "../types";

interface UseNotificationsProps {
  vehicles: any[];
}

export const useNotifications = ({ vehicles }: UseNotificationsProps) => {
  // Load notification preferences from localStorage immediately
  const loadNotificationPreferences = () => {
    try {
      const savedRead = localStorage.getItem("dashboard_read_notifications");
      const savedDeleted = localStorage.getItem("dashboard_deleted_notifications");
      
      const readSet = savedRead ? new Set<string>(JSON.parse(savedRead)) : new Set<string>();
      const deletedSet = savedDeleted ? new Set<string>(JSON.parse(savedDeleted)) : new Set<string>();
      
      return { readSet, deletedSet };
    } catch (err) {
      console.error("Error loading notification preferences:", err);
      return { readSet: new Set<string>(), deletedSet: new Set<string>() };
    }
  };

  const { readSet: initialReadSet, deletedSet: initialDeletedSet } = loadNotificationPreferences();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [readNotifications, setReadNotifications] = useState<Set<string>>(initialReadSet);
  const [deletedNotifications, setDeletedNotifications] = useState<Set<string>>(initialDeletedSet);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [notificationLoading, setNotificationLoading] = useState<boolean>(false);

  // Save read notifications to localStorage
  useEffect(() => {
    if (readNotifications.size === 0 && initialReadSet.size === 0) {
      return;
    }
    try {
      localStorage.setItem("dashboard_read_notifications", JSON.stringify(Array.from(readNotifications)));
    } catch (err) {
      console.error("Error saving read notifications:", err);
    }
  }, [readNotifications, initialReadSet]);

  // Save deleted notifications to localStorage
  useEffect(() => {
    if (deletedNotifications.size === 0 && initialDeletedSet.size === 0) {
      return;
    }
    try {
      localStorage.setItem("dashboard_deleted_notifications", JSON.stringify(Array.from(deletedNotifications)));
    } catch (err) {
      console.error("Error saving deleted notifications:", err);
    }
  }, [deletedNotifications, initialDeletedSet]);

  // Calculate unread notifications count
  const unreadCount = useMemo(() => {
    return notifications.filter((notif) => !readNotifications.has(notif.id)).length;
  }, [notifications, readNotifications]);

  // Helper function to check if user needs KYC verification
  const hasAllKycFields = (user: RawApiUser): boolean => {
    const kyc = user.kyc || ({} as any);
    const required = [
      kyc.idNumber,
      kyc.idFrontImage,
      kyc.idBackImage,
      kyc.licenseFrontImage,
      kyc.licenseBackImage,
    ];
    return required.every((v) => v !== undefined && v !== null && String(v).trim() !== "");
  };

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      setNotificationLoading(true);
      const newNotifications: Notification[] = [];

      // Fetch maintenance requests
      try {
        const maintenanceData = await getMaintenanceRequestsPaginated(1, 50);
        const pendingMaintenance = maintenanceData.items.filter(
          (req: any) => req.status === "pending" || req.status === "pending_maintenance"
        );

        pendingMaintenance.forEach((req: any) => {
          const vehicle = vehicles.find((v) => v._id === req.vehicleId || v._id === req.vehicle?._id);
          newNotifications.push({
            id: `maintenance-${req._id}`,
            type: "maintenance",
            title: "Maintenance Request",
            message: vehicle
              ? `${vehicle.brand} ${vehicle.model} (${vehicle.plateNumber}) needs maintenance`
              : `Vehicle maintenance request #${req._id.slice(-6)}`,
            timestamp: new Date(req.createdAt || Date.now()),
            vehicleId: req.vehicleId || req.vehicle?._id,
            priority: "high",
          });
        });
      } catch (err: any) {
        if (err?.response?.status !== 401 && err?.message?.includes("401") === false) {
          console.error("Error fetching maintenance requests:", err);
        }
      }

      // Fetch users needing KYC verification
      try {
        const rentersData = await getRenters({ page: 1, limit: 100 });
        const kycPendingUsers = (rentersData.items || []).filter(
          (user: RawApiUser) =>
            user.role === "renter" &&
            !user.kyc?.verified &&
            hasAllKycFields(user)
        );

        kycPendingUsers.forEach((user: RawApiUser) => {
          newNotifications.push({
            id: `kyc-${user._id}`,
            type: "kyc",
            title: "KYC Verification Required",
            message: `${user.name || user.email} submitted KYC documents for review`,
            timestamp: new Date(user.createdAt || Date.now()),
            userId: user._id,
            priority: "medium",
          });
        });
      } catch (err: any) {
        if (err?.response?.status !== 401 && err?.message?.includes("401") === false) {
          console.error("Error fetching KYC users:", err);
        }
      }

      // Fetch damage reports with "reported" status (pending review)
      try {
        const damageReportsData = await getAllDamageReports({
          page: 1,
          limit: 50,
          status: "reported",
        });

        const pendingDamageReports = damageReportsData.data?.items || [];

        pendingDamageReports.forEach((report: any) => {
          const vehicleName = report.vehicle
            ? `${report.vehicle.brand || ""} ${report.vehicle.model || ""} (${report.vehicle.plateNumber || ""})`.trim()
            : "Unknown Vehicle";
          const reporterName = report.reportedBy?.name || "Staff";

          newNotifications.push({
            id: `damage-${report._id}`,
            type: "damage",
            title: "Damage Report Submitted",
            message: `${reporterName} reported damage for ${vehicleName}`,
            timestamp: new Date(report.createdAt || Date.now()),
            vehicleId: report.vehicle?._id,
            damageReportId: report._id,
            priority: "high",
          });
        });
      } catch (err: any) {
        if (err?.response?.status !== 401 && err?.message?.includes("401") === false) {
          console.error("Error fetching damage reports:", err);
        }
      }

      // Filter out deleted notifications
      const filteredNotifications = newNotifications.filter(
        (notif) => !deletedNotifications.has(notif.id)
      );

      // Sort by priority and timestamp
      filteredNotifications.sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return b.timestamp.getTime() - a.timestamp.getTime();
      });

      setNotifications(filteredNotifications);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setNotificationLoading(false);
    }
  }, [vehicles, deletedNotifications]);

  // Delete notification
  const deleteNotification = useCallback((notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((notif) => notif.id !== notificationId));
    setReadNotifications((prev) => {
      const newSet = new Set(prev);
      newSet.delete(notificationId);
      return newSet;
    });
    setDeletedNotifications((prev) => {
      const newSet = new Set(prev);
      newSet.add(notificationId);
      return newSet;
    });
  }, []);

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    const currentIds = notifications.map((notif) => notif.id);
    setDeletedNotifications((prev) => {
      const newSet = new Set(prev);
      currentIds.forEach((id) => newSet.add(id));
      return newSet;
    });
    setNotifications([]);
    setReadNotifications(new Set());
  }, [notifications]);

  // Handle notification click
  const handleNotificationClick = useCallback((notif: Notification) => {
    setReadNotifications((prev) => {
      const newSet = new Set(prev);
      newSet.add(notif.id);
      return newSet;
    });
    
    setShowNotifications(false);
    
    setTimeout(() => {
      if (notif.type === "maintenance") {
        if (notif.vehicleId) {
          window.location.href = `/admin/vehicles?tab=requests&vehicleId=${notif.vehicleId}`;
        } else {
          window.location.href = "/admin/vehicles?tab=requests";
        }
      } else if (notif.type === "kyc") {
        if (notif.userId) {
          window.location.href = `/admin/users/verification?userId=${notif.userId}`;
        } else {
          window.location.href = "/admin/users/verification";
        }
      } else if (notif.type === "damage") {
        if (notif.damageReportId) {
          window.location.href = `/admin/damage-reports?reportId=${notif.damageReportId}`;
        } else {
          window.location.href = "/admin/damage-reports";
        }
      }
    }, 100);
  }, []);

  return {
    notifications,
    readNotifications,
    unreadCount,
    showNotifications,
    setShowNotifications,
    notificationLoading,
    fetchNotifications,
    deleteNotification,
    clearAllNotifications,
    handleNotificationClick,
  };
};

