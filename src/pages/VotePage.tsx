import { useState } from "react";
import {
  ArrowBack,
  CheckCircle,
  HowToVoteOutlined,
  InfoOutlined,
  LockOutlined,
} from "@mui/icons-material";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardActionArea,
  Container,
  Grid,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

const candidates = [
  { id: 1, name: "Ana Martínez", party: "Innovación Universitaria", description: "Transparencia institucional y digitalización académica.", initials: "AM", color: "#155eef" },
  { id: 2, name: "Carlos Hernández", party: "Unidad Estudiantil", description: "Fortalecimiento de actividades culturales y deportivas.", initials: "CH", color: "#7f56d9" },
  { id: 3, name: "Lucía Ramírez", party: "Futuro Colectivo", description: "Más espacios de colaboración, bienestar y participación.", initials: "LR", color: "#039855" },
];

function VotePage() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selectedCandidate = candidates.find((candidate) => candidate.id === selectedId);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Box sx={{ bgcolor: "#101828", color: "white" }}>
        <Container maxWidth="lg">
          <Stack direction="row" sx={{ py: 2.5, justifyContent: "space-between", alignItems: "center" }}>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
              <HowToVoteOutlined sx={{ color: "#6ce9a6" }} />
              <Typography sx={{ fontWeight: 700 }}>VotoClaro</Typography>
            </Stack>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <LockOutlined sx={{ fontSize: 17, color: "#6ce9a6" }} />
              <Typography variant="body2" sx={{ color: "#d0d5dd" }}>Voto anónimo y protegido</Typography>
            </Stack>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 7 } }}>
        <Button
          startIcon={<ArrowBack />}
          sx={{ mb: 4, color: "text.secondary" }}
        >
          Salir de la elección
        </Button>
        <Stack direction={{ xs: "column", md: "row" }} spacing={3} sx={{ mb: 5, justifyContent: "space-between" }}>
          <Box>
            <Typography variant="overline" sx={{ color: "primary.main", fontWeight: 700, letterSpacing: ".12em" }}>PASO 1 DE 1</Typography>
            <Typography variant="h2" sx={{ fontSize: { xs: "2.3rem", md: "3.4rem" }, mt: 1 }}>Elige a tu representante</Typography>
            <Typography color="text.secondary" sx={{ mt: 1.5, fontSize: "1.05rem" }}>Revisa las propuestas y selecciona una opción.</Typography>
          </Box>
          <Box sx={{ minWidth: { md: 220 }, alignSelf: { md: "end" } }}>
            <Stack direction="row" sx={{ mb: 1, justifyContent: "space-between" }}>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>Tu progreso</Typography>
              <Typography variant="body2" color="text.secondary">100%</Typography>
            </Stack>
            <LinearProgress variant="determinate" value={100} sx={{ height: 8, borderRadius: 4, bgcolor: "#e4e7ec", "& .MuiLinearProgress-bar": { borderRadius: 4 } }} />
          </Box>
        </Stack>

        <Alert icon={<InfoOutlined />} severity="info" sx={{ mb: 4, border: "1px solid #b2ddff", bgcolor: "#eff8ff", color: "#175cd3", "& .MuiAlert-icon": { color: "#175cd3" } }}>
          Tu identidad ya fue verificada. La plataforma registra tu participación, nunca tu elección.
        </Alert>

        <Paper sx={{ p: { xs: 2, md: 4 }, border: "1px solid #eaecf0", boxShadow: "0 4px 16px rgba(16,24,40,.04)" }}>
          <Stack direction="row" sx={{ mb: 3, justifyContent: "space-between", alignItems: "center" }}>
            <Box>
              <Typography variant="h5">Alumno Consejero</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: .5 }}>Selecciona solo una candidatura</Typography>
            </Box>
            <Typography variant="body2" color={selectedId ? "primary.main" : "text.secondary"} sx={{ fontWeight: 700 }}>{selectedId ? "1 seleccionada" : "Ninguna seleccionada"}</Typography>
          </Stack>
          <Grid container spacing={2}>
            {candidates.map((candidate) => {
              const isSelected = selectedId === candidate.id;
              return (
                <Grid key={candidate.id} size={{ xs: 12, md: 4 }}>
                  <Card sx={{ height: "100%", border: "2px solid", borderColor: isSelected ? "primary.main" : "#eaecf0", bgcolor: isSelected ? "#f5f8ff" : "white", borderRadius: 3, boxShadow: isSelected ? "0 0 0 4px rgba(21,94,239,.1)" : "none", transition: "all .2s ease" }}>
                    <CardActionArea onClick={() => setSelectedId(candidate.id)} sx={{ height: "100%", p: 2.5 }}>
                      <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                        <Avatar sx={{ width: 56, height: 56, bgcolor: candidate.color, fontWeight: 700 }}>{candidate.initials}</Avatar>
                        {isSelected && <CheckCircle color="primary" />}
                      </Stack>
                      <Typography variant="h6" sx={{ mt: 3 }}>{candidate.name}</Typography>
                      <Typography sx={{ color: "primary.main", fontWeight: 700, fontSize: ".9rem", mt: .5 }}>{candidate.party}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, mt: 2, minHeight: 45 }}>{candidate.description}</Typography>
                      <Button variant={isSelected ? "contained" : "outlined"} fullWidth sx={{ mt: 3, py: 1.1 }} startIcon={isSelected ? <CheckCircle /> : undefined}>
                        {isSelected ? "Candidato seleccionado" : "Seleccionar"}
                      </Button>
                    </CardActionArea>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{
              mt: 4,
              pt: 3,
              borderTop: "1px solid #eaecf0",
              justifyContent: "space-between",
              alignItems: { sm: "center" },
            }}
          >
            <Typography variant="body2" color="text.secondary">Puedes cambiar tu selección antes de confirmar.</Typography>
            <Button variant="contained" size="large" disabled={!selectedCandidate} sx={{ px: 4, py: 1.4 }}>Confirmar mi voto</Button>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}

export default VotePage;
