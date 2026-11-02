import { Box, CircularProgress, Typography } from "@mui/material";

type LoadingPageProps = {
  message?: string;
};

function LoadingPage({ message = "Cargando información..." }: LoadingPageProps) {
    return (
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            bgcolor: "background.default",
          }}
        >
          <CircularProgress size={28} thickness={4} aria-label="Cargando" />
          <Typography color="text.secondary" role="status" aria-live="polite">
            {message}
          </Typography>
        </Box>
    )
}

export default LoadingPage;
