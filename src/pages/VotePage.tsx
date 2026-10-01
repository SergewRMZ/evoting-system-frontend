import { useState } from "react";
import {
  ArrowBack,
  CheckCircle,
  InfoOutlined,
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
import Navbar from "../components/Navbar";

type EncryptedVote = {
  c1: string;
  c2: string;
};

type Candidate = {
  candidacyId: number;
  name: string;
  party: string;
  description: string;
  initials: string;
  color: string;
  vote: EncryptedVote;
};

type VotePayload = {
  electionId: number;
  positions: {
    positionId: number;
    ballot: {
      candidacyId: number;
      vote: EncryptedVote;
    }[];
  }[];
};

const candidates: Candidate[] = [
  {
    candidacyId: 101,
    name: "Ana Martínez",
    party: "Innovación Universitaria",
    description: "Transparencia institucional y digitalización académica.",
    initials: "AM",
    color: "#232935",
    vote: {
      c1: "Am/BR86E8Y2GDGsd2Z3mQqtY9vTH3ikhUrBKM+5qQ8WT",
      c2: "A8/Xk91F1P82KDls91Z3mQqtY9vTH3ikhUrBKM+1aP92",
    },
  },
  {
    candidacyId: 102,
    name: "Carlos Hernández",
    party: "Unidad Estudiantil",
    description: "Fortalecimiento de actividades culturales y deportivas.",
    initials: "CH",
    color: "#7f56d9",
    vote: {
      c1: "B2/CK97F9Z3HEHte3a4nRruZ0wUI4jliVsCLN+6rR9XU",
      c2: "B9/Yl02G2Q93LEmt02a4nRruZ0wUI4jliVsCLN+2bQ03",
    },
  },
  {
    candidacyId: 103,
    name: "Lucía Ramírez",
    party: "Futuro Colectivo",
    description: "Más espacios de colaboración, bienestar y participación.",
    initials: "LR",
    color: "#039855",
    vote: {
      c1: "C3/DL08G0a4IFIuf4b5oSsva1xVJ5kmjWtDMO+7sS0YV",
      c2: "C0/Zm13H3r04MFnu13b5oSsva1xVJ5kmjWtDMO+3cR14",
    },
  },
];

function createVotePayload(selectedCandidate: Candidate): VotePayload {
  return {
    electionId: 1,
    positions: [
      {
        positionId: 1,
        ballot: [
          {
            candidacyId: selectedCandidate.candidacyId,
            vote: selectedCandidate.vote,
          },
        ],
      },
    ],
  };
}

function VotePage() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [submittedPayload, setSubmittedPayload] = useState<VotePayload | null>(null);
  const selectedCandidate = candidates.find((candidate) => candidate.candidacyId === selectedId);

  const handleConfirmVote = () => {
    if (!selectedCandidate) {
      return;
    }

    const payload = createVotePayload(selectedCandidate);
    setSubmittedPayload(payload);
    console.log("Payload de voto:", payload);
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Navbar />

      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 7 } }}>
        <Button startIcon={<ArrowBack />} sx={{ mb: 4, color: "text.secondary" }}>
          Salir de la elección
        </Button>
        <Stack direction={{ xs: "column", md: "row" }} spacing={3} sx={{ mb: 5, justifyContent: "space-between" }}>
          <Box>
            <Typography variant="overline" sx={{ color: "primary.main", fontWeight: 700, letterSpacing: ".12em" }}>
              PASO 1 DE 1
            </Typography>
            <Typography variant="h2" sx={{ fontSize: { xs: "2.3rem", md: "3.4rem" }, mt: 1 }}>
              Elige a tu representante
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1.5, fontSize: "1.05rem" }}>
              Revisa las propuestas y selecciona una opción.
            </Typography>
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
            <Typography variant="body2" color={selectedId ? "primary.main" : "text.secondary"} sx={{ fontWeight: 700 }}>
              {selectedId ? "1 seleccionada" : "Ninguna seleccionada"}
            </Typography>
          </Stack>
          <Grid container spacing={2}>
            {candidates.map((candidate) => {
              const isSelected = selectedId === candidate.candidacyId;
              return (
                <Grid key={candidate.candidacyId} size={{ xs: 12, md: 4 }}>
                  <Card sx={{ height: "100%", border: "2px solid", borderColor: isSelected ? "primary.main" : "#eaecf0", bgcolor: isSelected ? "#f5f8ff" : "white", borderRadius: 3, boxShadow: isSelected ? "0 0 0 4px rgba(21,94,239,.1)" : "none", transition: "all .2s ease" }}>
                    <CardActionArea onClick={() => setSelectedId(candidate.candidacyId)} sx={{ height: "100%", p: 2.5 }}>
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
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 4, pt: 3, borderTop: "1px solid #eaecf0", justifyContent: "space-between", alignItems: { sm: "center" } }}>
            <Typography variant="body2" color="text.secondary">Puedes cambiar tu selección antes de confirmar.</Typography>
            <Button variant="contained" size="large" disabled={!selectedCandidate} onClick={handleConfirmVote} sx={{ px: 4, py: 1.4 }}>
              Confirmar mi voto
            </Button>
          </Stack>
        </Paper>

        {submittedPayload && (
          <Paper component="section" aria-live="polite" sx={{ mt: 3, p: { xs: 2, md: 3 }, bgcolor: "#ecfdf3", border: "1px solid #abefc6" }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 1 }}>
              <CheckCircle sx={{ color: "#039855" }} />
              <Typography variant="h6">Voto preparado correctamente</Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Este es el JSON listo para enviarse al servicio de votación.
            </Typography>
            <Box component="pre" sx={{ m: 0, p: 2, overflowX: "auto", borderRadius: 2, bgcolor: "#101828", color: "#d1fadf", fontSize: { xs: ".72rem", md: ".85rem" } }}>
              {JSON.stringify(submittedPayload, null, 2)}
            </Box>
          </Paper>
        )}
      </Container>
    </Box>
  );
}

export default VotePage;
