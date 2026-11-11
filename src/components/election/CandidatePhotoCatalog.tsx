import { useState, type ChangeEvent } from "react";
import { Alert, Avatar, Box, Button, Chip, Paper, Stack, Typography } from "@mui/material";
import electionServiceApi from "../../services/election-service/election.api";
import type { Candidate } from "../../services/election-service/election.types";
import {
  CANDIDATE_PHOTO_ACCEPT,
  CANDIDATE_PHOTO_RULES,
  getCandidatePhotoErrorMessage,
  getCandidatePhotoUrl,
  validateCandidatePhoto,
} from "../../utils/candidatePhoto";

type Feedback = { severity: "success" | "error"; text: string };

type CandidatePhotoCatalogProps = {
  candidates: Candidate[];
  disabled?: boolean;
  onPhotoUploaded: (candidateId: string) => void;
};

const fullNameOf = (candidate: Candidate) => `${candidate.name} ${candidate.lastName}`.trim();

const initialsOf = (candidate: Candidate) =>
  `${candidate.name.trim().charAt(0)}${candidate.lastName.trim().charAt(0)}`.toUpperCase();

/**
 * Catálogo de candidatos con la opción de agregar o cambiar su fotografía, por ejemplo
 * cuando la subida falló al registrarlos.
 */
function CandidatePhotoCatalog({ candidates, disabled = false, onPhotoUploaded }: CandidatePhotoCatalogProps) {
  const [uploadingId, setUploadingId] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  // Cambia la URL de la foto reemplazada para que el navegador la vuelva a cargar.
  const [photoVersions, setPhotoVersions] = useState<Record<string, number>>({});

  if (candidates.length === 0) return null;

  const uploadPhoto = async (candidate: Candidate, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // Permite volver a elegir el mismo archivo si el intento falló.
    event.target.value = "";
    if (!file) return;

    const validationError = validateCandidatePhoto(file);
    if (validationError) {
      setFeedback({ severity: "error", text: `${fullNameOf(candidate)}: ${validationError}` });
      return;
    }

    setUploadingId(candidate.id);
    setFeedback(null);
    try {
      await electionServiceApi.uploadCandidatePhoto(candidate.id, file);
      setPhotoVersions((current) => ({ ...current, [candidate.id]: Date.now() }));
      onPhotoUploaded(candidate.id);
      setFeedback({ severity: "success", text: `Se guardó la fotografía de ${fullNameOf(candidate)}.` });
    } catch (uploadError) {
      setFeedback({ severity: "error", text: `${fullNameOf(candidate)}: ${getCandidatePhotoErrorMessage(uploadError)}` });
    } finally {
      setUploadingId("");
    }
  };

  return (
    <Paper variant="outlined" sx={{ p: { xs: 2, md: 2.5 }, mb: 3, borderColor: "divider" }}>
      <Typography variant="h6" sx={{ fontWeight: 700 }}>Catálogo de candidatos</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
        Agrega o cambia la fotografía de un candidato ya registrado. {CANDIDATE_PHOTO_RULES}
      </Typography>

      {feedback && (
        <Alert severity={feedback.severity} sx={{ mb: 2 }} onClose={() => setFeedback(null)}>
          {feedback.text}
        </Alert>
      )}

      <Stack spacing={1.5}>
        {candidates.map((candidate) => {
          const uploading = uploadingId === candidate.id;
          return (
            <Stack
              key={candidate.id}
              direction="row"
              spacing={1.5}
              sx={{ alignItems: "center", justifyContent: "space-between" }}
            >
              <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", minWidth: 0 }}>
                <Avatar
                  src={candidate.hasPhoto ? getCandidatePhotoUrl(candidate.id, photoVersions[candidate.id]) : undefined}
                  alt={fullNameOf(candidate)}
                >
                  {initialsOf(candidate)}
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                  <Typography noWrap>{fullNameOf(candidate)}</Typography>
                  {!candidate.hasPhoto && (
                    <Chip size="small" label="Sin fotografía" color="warning" variant="outlined" sx={{ mt: 0.5 }} />
                  )}
                </Box>
              </Stack>
              <Button
                component="label"
                variant="text"
                disabled={disabled || Boolean(uploadingId)}
                sx={{ flexShrink: 0 }}
              >
                {uploading ? "Subiendo..." : candidate.hasPhoto ? "Cambiar fotografía" : "Agregar fotografía"}
                <input
                  type="file"
                  hidden
                  accept={CANDIDATE_PHOTO_ACCEPT}
                  aria-label={`Fotografía de ${fullNameOf(candidate)}`}
                  onChange={(event) => void uploadPhoto(candidate, event)}
                />
              </Button>
            </Stack>
          );
        })}
      </Stack>
    </Paper>
  );
}

export default CandidatePhotoCatalog;
