import { AxiosError } from "axios";
import api from "../Utils";

// ============================================
// ✅ TYPE DEFINITIONS
// ============================================

export interface FleetRecommendationRequest {
  question?: string;
  context?: {
    vehicles?: any;
    stations?: any;
    bookings?: any;
  };
}

export interface FleetRecommendationResponse {
  ok?: boolean;
  recommendation?: string;
  success?: boolean;
  data?: {
    recommendation: string;
    analysis?: any;
  };
  message?: string;
  error?: string;
}

// ============================================
// ✅ ERROR HANDLER
// ============================================

const handleError = (error: unknown): FleetRecommendationResponse => {
  const err = error as AxiosError<FleetRecommendationResponse>;
  
  console.error("AI API Error:", {
    status: err?.response?.status,
    data: err?.response?.data,
    message: err?.message,
  });

  let errorMessage = err?.message || "Unknown error";

  if (err?.response?.data) {
    const responseData = err.response.data;
    if (responseData.error) {
      errorMessage = responseData.error;
    } else if (responseData.message) {
      errorMessage = responseData.message;
    } else if (typeof responseData === "string") {
      errorMessage = responseData;
    }
  }

  return {
    success: false,
    message: errorMessage,
    error: errorMessage,
  };
};

// ============================================
// ✅ API FUNCTIONS
// ============================================

/**
 * GET /api/ai/fleet-recommendation
 * Get AI fleet recommendation based on current data
 */
export const getFleetRecommendation = async (
  request: FleetRecommendationRequest
): Promise<FleetRecommendationResponse> => {
  try {
    // Check if baseURL already includes /api
    const baseURL = api.defaults.baseURL || "";
    const hasApiPrefix = baseURL.endsWith("/api");
    
    // Endpoint: /ai/fleet-recommendation (with leading slash to ensure proper URL joining)
    // Full URL should be: https://be-ev-rental-system-production.up.railway.app/api/ai/fleet-recommendation
    const endpoint = hasApiPrefix ? "/ai/fleet-recommendation" : "/api/ai/fleet-recommendation";
    
    console.log("🔄 Calling AI endpoint:", endpoint);
    console.log("📤 Request payload:", request);
    console.log("📡 BaseURL:", baseURL);
    console.log("📡 Full URL will be:", baseURL + endpoint);
    
    // Use GET method with query params
    // Note: For GET, we only send question. Context is too large for query params.
    // Backend should fetch context data itself if needed.
    const params: any = {};
    if (request.question) {
      params.question = request.question;
    }
    // Don't send context via GET - it's too large and causes ERR_HTTP2_PROTOCOL_ERROR
    // Backend should have access to database to fetch context if needed
    
    const response = await api.get<FleetRecommendationResponse>(
      endpoint,
      {
        params,
      }
    );

    console.log("✅ AI Recommendation response:", response.data);
    console.log("✅ Response status:", response.status);

    // Handle different response formats
    if (response.data) {
      const data = response.data;
      
      // Handle format: { ok: true, recommendation: "..." }
      if (data.ok && data.recommendation) {
        return {
          ok: true,
          recommendation: data.recommendation,
          success: true,
          data: {
            recommendation: data.recommendation,
          },
        };
      }
      
      // Handle format: { success: true, data: { recommendation: "..." } }
      if (data.success && data.data?.recommendation) {
        return data;
      }
      
      // Handle format: { recommendation: "..." } directly
      if (data.recommendation) {
        return {
          ok: true,
          recommendation: data.recommendation,
          success: true,
          data: {
            recommendation: data.recommendation,
          },
        };
      }
      
      // Direct response
      return data;
    }

    throw new Error("Invalid API response format");
  } catch (error: any) {
    // Log detailed error info
    console.error("❌ AI API Error Details:", {
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      url: error?.config?.url,
      baseURL: error?.config?.baseURL,
      fullURL: error?.config?.baseURL + error?.config?.url,
      method: error?.config?.method,
      headers: error?.config?.headers,
      requestData: error?.config?.data,
      responseData: error?.response?.data,
      message: error?.message,
    });

    // Handle network errors (ERR_HTTP2_PROTOCOL_ERROR, Network Error, etc.)
    if (error?.message === "Network Error" || error?.code === "ERR_HTTP2_PROTOCOL_ERROR" || !error?.response) {
      console.error("❌ Network Error - Could not reach server");
      console.error("   This might be due to:");
      console.error("   1. URL too long (context data in query params)");
      console.error("   2. Server not responding");
      console.error("   3. CORS issue");
      console.error("   4. Network connectivity problem");
      
      return {
        success: false,
        message: "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng hoặc thử lại sau.",
        error: "Network Error",
      };
    }

    // Handle 500 Internal Server Error
    if (error?.response?.status === 500) {
      console.error("❌ Server Error (500)");
      console.error("   Server response:", error?.response?.data);
      console.error("   Possible causes:");
      console.error("   1. Backend server error");
      console.error("   2. API token expired or invalid");
      console.error("   3. Database connection issue");
      console.error("   4. AI service unavailable");
      
      const serverMessage = error?.response?.data?.message || 
                           error?.response?.data?.error || 
                           "Lỗi server nội bộ";
      
      return {
        success: false,
        message: `Lỗi server (500): ${serverMessage}. Vui lòng thử lại sau hoặc liên hệ admin.`,
        error: "Internal Server Error",
      };
    }

    // Handle 401/403 - Authentication/Authorization errors
    if (error?.response?.status === 401 || error?.response?.status === 403) {
      console.error("❌ Authentication/Authorization Error");
      console.error("   Status:", error?.response?.status);
      console.error("   Server response:", error?.response?.data);
      
      return {
        success: false,
        message: "Không có quyền truy cập. Vui lòng đăng nhập lại.",
        error: "Unauthorized/Forbidden",
      };
    }

    // Handle 404 gracefully - endpoint might not be ready yet
    if (error?.response?.status === 404) {
      console.warn("⚠️ AI endpoint not found (404).");
      console.warn("⚠️ Attempted URL:", error?.config?.baseURL + error?.config?.url);
      console.warn("⚠️ Method:", error?.config?.method);
      console.warn("⚠️ Response from server:", error?.response?.data);
      console.warn("⚠️ Please verify:");
      console.warn("   1. Backend endpoint is deployed: /api/ai/fleet-recommendation");
      console.warn("   2. Route accepts GET method");
      console.warn("   3. Authentication/authorization is correct");
      console.warn("   4. CORS is configured properly");
      
      // Try to extract more info from response
      const serverMessage = error?.response?.data?.message || 
                           error?.response?.data?.error || 
                           JSON.stringify(error?.response?.data);
      
      return {
        success: false,
        message: `AI endpoint chưa sẵn sàng (404). ${serverMessage ? `Server response: ${serverMessage}` : 'Vui lòng kiểm tra lại backend hoặc thử lại sau.'}`,
        error: "Endpoint not found",
      };
    }
    
    // For other errors, use handleError
    return handleError(error);
  }
};

// ============================================
// ✅ EXPORT DEFAULT
// ============================================

export default {
  getFleetRecommendation,
};

