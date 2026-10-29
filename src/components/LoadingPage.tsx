import { Box, CircularProgress, Typography } from "@mui/material";

function LoadingPage() {
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
          <CircularProgress color="primary" aria-label="Loading..."/>
          <Typography variant="h5">
            Cargando...
          </Typography>
        </Box>
    )
}

export default LoadingPage;