import { Alert } from "@mui/material";
import type { AlertColor } from "@mui/material";

type FeedbackAlertProps = {
  message: string;
  severity: AlertColor;
};

function FeedbackAlert({ message, severity }: FeedbackAlertProps) {
  return (
    <Alert severity={severity} role={severity === "error" ? "alert" : "status"}>
      {message}
    </Alert>
  );
}

export default FeedbackAlert;
