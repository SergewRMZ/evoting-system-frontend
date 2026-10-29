import { CheckCircle } from "@mui/icons-material";
import {
  Avatar,
  Card,
  CardActionArea,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import type { Candidacy, Candidate } from "../../services/election-service/election.types";

const avatarColors = ["#155eef", "#7f56d9", "#039855", "#dc6803"];

function getInitials(candidacy: Candidate) {
  return `${candidacy.name.trim().charAt(0)}${candidacy.lastName.trim().charAt(0)}`.toUpperCase();
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
        border: "2px solid",
        borderColor: selected ? "primary.main" : "primary.contrastText",
        bgcolor: selected ? "background.paper" : "background.default",
        borderRadius: 3,
        boxShadow: selected ? "0 0 0 4px rgba(21,94,239,.1)" : "none",
        transition: "all .2s ease",
      }}
    >
      <CardActionArea
        disabled={!candidate.isActive || selectionDisabled}
        aria-pressed={selected}
        onClick={() => onSelect(candidacy.candidacyId)}
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
          {selectionDisabled
            ? "Selección cerrada"
            : !candidate.isActive
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
