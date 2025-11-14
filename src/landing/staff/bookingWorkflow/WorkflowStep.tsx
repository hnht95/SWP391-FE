import { motion } from "framer-motion";
import { MdCheckCircle } from "react-icons/md";
import type { WorkflowStep as WorkflowStepType, StepStatus } from "./types";

interface WorkflowStepProps {
  step: WorkflowStepType;
  stepStatus: StepStatus;
  index: number;
  isLast: boolean;
}

export const WorkflowStep = ({
  step,
  stepStatus,
  index,
  isLast,
}: WorkflowStepProps) => {
  const Icon = step.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`relative border rounded-lg p-4 ${
        stepStatus === "completed"
          ? "bg-green-50 border-green-200"
          : stepStatus === "current"
          ? "bg-blue-50 border-blue-400 shadow-md"
          : "bg-gray-50 border-gray-200"
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Step Number/Icon */}
        <div
          className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
            stepStatus === "completed"
              ? "bg-green-500 text-white"
              : stepStatus === "current"
              ? "bg-blue-500 text-white"
              : "bg-gray-300 text-gray-600"
          }`}
        >
          {stepStatus === "completed" ? (
            <MdCheckCircle className="w-6 h-6" />
          ) : (
            <Icon className="w-6 h-6" />
          )}
        </div>

        {/* Step Content */}
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3
              className={`font-semibold ${
                stepStatus === "current"
                  ? "text-blue-900"
                  : stepStatus === "completed"
                  ? "text-green-900"
                  : "text-gray-600"
              }`}
            >
              {step.number}. {step.label}
            </h3>
            {stepStatus === "completed" && (
              <span className="text-xs text-green-600 font-medium">
                ✓ Completed
              </span>
            )}
            {stepStatus === "current" && (
              <span className="text-xs text-blue-600 font-medium animate-pulse">
                ● In progress
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 mt-1">{step.description}</p>

          {/* Action Component */}
          {step.action && step.component && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3"
            >
              {step.component}
            </motion.div>
          )}
        </div>
      </div>

      {/* Connector Line */}
      {!isLast && (
        <div className="absolute left-[29px] top-[60px] w-0.5 h-4 bg-gray-300" />
      )}
    </motion.div>
  );
};
