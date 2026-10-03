import { CheckCircle } from "@mui/icons-material";
import {
  Avatar,
  Card,
  CardActionArea,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import type { Candidate } from "../elections/electionTypes";

const avatarColors = ["#6655bf", "#247959", "#8c5c33", "#b14a58"];

function getInitials(candidate: Candidate) {
  return `${candidate.name.trim().charAt(0)}${candidate.lastName.trim().charAt(0)}`.toUpperCase();
}

type CandidateCardProps = {
  candidate: Candidate;
  colorIndex: number;
  selected: boolean;
  onSelect: (candidateId: string) => void;
};

function CandidateCard({
  candidate,
  colorIndex,
  selected,
  onSelect,
}: CandidateCardProps) {
  return (
    <Card
      sx={{
        height: "100%",
        border: "2px solid",
        borderColor: selected ? "primary.main" : "divider",
        bgcolor: selected ? "rgba(155,138,251,.08)" : "background.paper",
        borderRadius: 3,
        boxShadow: selected ? "0 0 0 4px rgba(155,138,251,.12)" : "none",
        transition: "all .2s ease",
      }}
    >
      <CardActionArea
        disabled={!candidate.isActive}
        aria-pressed={selected}
        onClick={() => onSelect(candidate.candidateId)}
        sx={{
          height: "100%",
          p: 2.5,
          "&.Mui-disabled": { opacity: 1 },
        }}
      >
        <Stack
          direction="row"
          sx={{ justifyContent: "space-between", alignItems: "flex-start" }}
        >
          <Avatar
            sx={{
              width: 56,
              height: 56,
              bgcolor: avatarColors[colorIndex % avatarColors.length],
              fontWeight: 700,
            }}
          >
            {getInitials(candidate)}
          </Avatar>
          {selected && <CheckCircle color="primary" />}
        </Stack>

        <Typography variant="h6" sx={{ mt: 3 }}>
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
            mt: 2,
            color: candidate.isActive ? "primary.main" : "text.secondary",
            fontWeight: 700,
            textAlign: "center",
          }}
        >
          {!candidate.isActive
            ? "No disponible para selección"
            : selected
              ? "Candidato seleccionado"
              : "Seleccionar"}
        </Typography>
      </CardActionArea>
    </Card>
  );
}

export default CandidateCard;
