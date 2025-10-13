import axios from "axios";

import api from "../Utils";

// const handleError = (error: unknown) => {
//   const err = error as AxiosError;
//   console.error("API Error:", {
//     status: err?.response?.status,
//     data: err?.response?.data,
//     message: err?.message,
//     request: err?.request,
//   });

//   let errorMessage = err?.message || "Unknown error";
//   if (err?.response) {
//     if (typeof err.response.data === "string") {
//       if (err.response.data.includes("MulterError: Unexpected field")) {
//         errorMessage =
//           "Invalid file field names. Please check poster and trailer fields.";
//       } else {
//         errorMessage = "Server returned an unexpected response";
//       }
//     } else {
//       const responseData: unknown = err.response.data;
//       if (typeof responseData === "object" && responseData !== null) {
//         const rd = responseData as Record<string, unknown>;
//         if (rd.message && typeof rd.message === "string") {
//           errorMessage = rd.message;
//         } else if (rd.errors) {
//           throw rd;
//         }
//       }
//     }
//   } else if (err?.request) {
//     errorMessage = "No response from server";
//   }

//   throw new Error(errorMessage);
// };
