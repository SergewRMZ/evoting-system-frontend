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
            gap: 2
          }}
        >
          <CircularProgress color="primary" aria-label="Cargando" />
          <Typography variant="h5" role="status" aria-live="polite">
            {message}
          </Typography>
        </Box>
    )
}

export default LoadingPage;