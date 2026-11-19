import { useState } from "react";
import { alpha } from "@mui/material/styles";
import { CheckCircle } from "@mui/icons-material";
import {
  Box,
  Card,
  CardActionArea,
  Chip,
  Typography,
} from "@mui/material";
import type { Candidacy, Candidate } from "../../services/election-service/election.types";
import { getCandidatePhotoUrl } from "../../utils/candidatePhoto";

const avatarColors = ["#155eef", "#7f56d9", "#039855", "#dc6803"];

function getInitials(candidacy: Candidate) {
  return `${candidacy.name.trim().charAt(0)}${candidacy.lastName.trim().charAt(0)}`.toUpperCase();
}

/**
 * Portada de la candidatura: la imagen completa al centro (sin recortes, sirve para fotos
 * verticales u horizontales) sobre una copia desenfocada que rellena el ancho de la tarjeta.
 * Sin foto, o si no carga, muestra las iniciales sobre un degradado.
 */
function CandidateCover({ candidate, color }: { candidate: Candidate; color: string }) {
  const [failed, setFailed] = useState(false);
  const photoUrl = candidate.hasPhoto && !failed ? getCandidatePhotoUrl(candidate.id) : null;
  const fullName = `${candidate.name} ${candidate.lastName}`.trim();

  return (
    <Box
      sx={{
        position: "relative",
        aspectRatio: "16 / 10",
        overflow: "hidden",
        bgcolor: "action.hover",
      }}
    >
      {photoUrl ? (
        <>
          <Box
            component="img"
            src={photoUrl}
            alt=""
            aria-hidden
            sx={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              filter: "blur(18px) brightness(0.6)",
              transform: "scale(1.15)",
            }}
          />
          <Box
            component="img"
            src={photoUrl}
            alt={fullName}
            loading="lazy"
            onError={() => setFailed(true)}
            sx={{
              position: "relative",
              display: "block",
              width: "100%",
              height: "100%",
              objectFit: "contain",
            }}
          />
        </>
      ) : (
        <Box
          sx={{
            height: "100%",
            display: "grid",
            placeItems: "center",
            background: `linear-gradient(135deg, ${color}, ${alpha(color, 0.45)})`,
          }}
        >
          <Typography sx={{ color: "common.white", fontSize: 48, fontWeight: 800, letterSpacing: 2 }}>
            {getInitials(candidate)}
          </Typography>
        </Box>
      )}
    </Box>
  );
}

type CandidateCardProps = {
  candidacy: Candidacy;
  colorIndex: number;
  selected: boolean;
  selectionDisabled?: boolean;
  onSelect: (candidacyId: string) => void;
};

function CandidateCard({
  candidacy,
  colorIndex,
  selected,
  selectionDisabled = false,
  onSelect,
}: CandidateCardProps) {
  const candidate = candidacy.candidate;
  return (
    <Card
      sx={{
        height: "100%",
        border: "1px solid",
        borderColor: selected ? "primary.main" : "divider",
        bgcolor: "background.paper",
        borderRadius: 3,
        overflow: "hidden",
        boxShadow: (theme) => (selected ? `0 0 0 3px ${alpha(theme.palette.primary.main, 0.16)}` : "none"),
        transition: "border-color .15s ease, box-shadow .15s ease",
      }}
    >
      <CardActionArea
        disabled={!candidate.isActive || selectionDisabled}
        aria-pressed={selected}
        onClick={() => onSelect(candidacy.candidacyId)}
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          justifyContent: "flex-start",
          "&.Mui-disabled": { opacity: 1 },
        }}
      >
        <Box sx={{ position: "relative" }}>
          <CandidateCover candidate={candidate} color={avatarColors[colorIndex % avatarColors.length]} />
          {selected && (
            <CheckCircle
              color="primary"
              sx={{
                position: "absolute",
                top: 12,
                right: 12,
                fontSize: 32,
                bgcolor: "background.paper",
                borderRadius: "50%",
              }}
            />
          )}
        </Box>

        <Box sx={{ p: 2.5, display: "flex", flexDirection: "column", flexGrow: 1 }}>
        <Typography variant="h6">
          {`${candidate.name} ${candidate.lastName}`.trim()}
        </Typography>
        <Chip
          size="small"
          label={candidate.isActive ? "Activo" : "Inactivo"}
          color={candidate.isActive ? "success" : "default"}
          sx={{ mt: 1 }}
        />
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ lineHeight: 1.6, mt: 2, minHeight: 45 }}
        >
          {candidate.description || "Sin descripción disponible."}
        </Typography>
        <Typography
          sx={{
            mt: "auto",
            pt: 2,
            color: candidate.isActive ? "primary.main" : "text.secondary",
            fontWeight: 700,
            textAlign: "center",
          }}
        >
          {selectionDisabled
            ? "Selección cerrada"
            : !candidate.isActive
            ? "No disponible para selección"
            : selected
              ? "Candidato seleccionado"
              : "Seleccionar"}
        </Typography>
        </Box>
      </CardActionArea>
    </Card>
  );
}

export default CandidateCard;
