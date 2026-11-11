import { keyframes } from "@emotion/react";
import {
  ChevronLeft,
  ChevronRight,
  EmojiEventsOutlined,
  ReplayOutlined,
} from "@mui/icons-material";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Fade,
  Grid,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useEffect, useState } from "react";
import type { ElectionPosition } from "../../services/election-service/election.types";
import type { ElectionTallyResult } from "../../services/tally-service/tally-service.types";
import { getCandidatePhotoUrl } from "../../utils/candidatePhoto";
import { summarizePosition } from "../../utils/results";

const avatarColors = ["#155eef", "#7f56d9", "#039855", "#dc6803"];
const GOLD = "#F5B700";
const DEFAULT_DURATION_MS = 1800;

const glow = keyframes`
  0%   { box-shadow: 0 0 0 0 ${alpha(GOLD, 0)}; transform: scale(1); }
  50%  { box-shadow: 0 0 32px 8px ${alpha(GOLD, 0.55)}; transform: scale(1.04); }
  100% { box-shadow: 0 0 18px 3px ${alpha(GOLD, 0.4)}; transform: scale(1.02); }
`;

/** Avanza de 0 a 1 en `duration` ms. Se reinicia al remontar el componente. */
function useRevealProgress(duration: number) {
  const [progress, setProgress] = useState(duration <= 0 ? 1 : 0);
  useEffect(() => {
    if (duration <= 0) return;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      setProgress(t);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [duration]);
  return progress;
}

const easeOut = (t: number) => 1 - (1 - t) ** 3;

type SlideProps = {
  position: ElectionPosition;
  results: ElectionTallyResult[];
  durationMs: number;
  reducedMotion: boolean;
};

function PositionResultsSlide({ position, results, durationMs, reducedMotion }: SlideProps) {
  const { candidates, total, winners } = summarizePosition(position, results);
  const progress = useRevealProgress(durationMs);
  const revealed = progress >= 1;
  const eased = easeOut(progress);
  const tie = winners.size > 1;

  if (candidates.length === 0) {
    return <Alert severity="info">Este cargo no tuvo candidaturas registradas.</Alert>;
  }

  return (
    <Stack spacing={2}>
      <Grid container spacing={2}>
        {candidates.map((candidate, index) => {
          const isWinner = revealed && winners.has(candidate.candidacyId);
          const shownVotes = Math.round(candidate.votes * eased);
          const percent = total > 0 ? (candidate.votes / total) * 100 : 0;
          return (
            <Grid key={candidate.candidacyId} size={{ xs: 12, sm: 6, md: 4 }}>
              <Paper
                variant="outlined"
                data-winner={isWinner || undefined}
                sx={{
                  p: 2.5,
                  height: "100%",
                  borderRadius: 3,
                  borderWidth: isWinner ? 2 : 1,
                  borderColor: isWinner ? GOLD : "divider",
                  opacity: revealed && winners.size > 0 && !isWinner ? 0.6 : 1,
                  transition: "opacity .4s ease, border-color .4s ease",
                  ...(isWinner &&
                    (reducedMotion
                      ? { boxShadow: `0 0 18px 3px ${alpha(GOLD, 0.4)}` }
                      : { animation: `${glow} 1.1s ease-out forwards` })),
                }}
              >
                <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                  <Avatar
                    src={candidate.hasPhoto ? getCandidatePhotoUrl(candidate.candidateId) : undefined}
                    alt={candidate.name}
                    sx={{
                      width: 64,
                      height: 64,
                      bgcolor: avatarColors[index % avatarColors.length],
                      fontWeight: 700,
                    }}
                  >
                    {candidate.name.charAt(0).toUpperCase()}
                  </Avatar>
                  {isWinner && (
                    <Chip
                      icon={<EmojiEventsOutlined />}
                      label={tie ? "Empate" : "Ganador"}
                      size="small"
                      sx={{ bgcolor: alpha(GOLD, 0.18), color: "text.primary", fontWeight: 700, "& .MuiChip-icon": { color: GOLD } }}
                    />
                  )}
                </Stack>
                <Typography variant="h6" sx={{ mt: 2 }}>
                  {candidate.name}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ alignItems: "baseline", mt: 1 }}>
                  <Typography
                    variant="h4"
                    aria-label={revealed ? `${candidate.votes} votos` : undefined}
                    sx={{ fontWeight: 800, fontVariantNumeric: "tabular-nums" }}
                  >
                    {shownVotes.toLocaleString("es-MX")}
                  </Typography>
                  <Typography color="text.secondary">votos</Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={percent * eased}
                  sx={{
                    mt: 1.5,
                    height: 8,
                    borderRadius: 4,
                    "& .MuiLinearProgress-bar": isWinner ? { bgcolor: GOLD } : {},
                  }}
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                  {(percent * eased).toFixed(1)} %
                </Typography>
              </Paper>
            </Grid>
          );
        })}
      </Grid>
      <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center" }}>
        {total.toLocaleString("es-MX")} votos contabilizados para este cargo
        {revealed && winners.size === 0 && " · sin votos registrados"}
      </Typography>
    </Stack>
  );
}

type ResultsCarouselProps = {
  positions: ElectionPosition[];
  results: ElectionTallyResult[];
  /** Duración del conteo animado; 0 muestra el resultado de inmediato. */
  durationMs?: number;
};

/**
 * Resultados por cargo, uno a la vez. Al mostrar cada cargo los votos cuentan desde
 * cero y al terminar se ilumina la candidatura ganadora (o las empatadas).
 */
function ResultsCarousel({ positions, results, durationMs = DEFAULT_DURATION_MS }: ResultsCarouselProps) {
  const [index, setIndex] = useState(0);
  const [replay, setReplay] = useState(0);
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const duration = reducedMotion ? 0 : durationMs;

  if (positions.length === 0) {
    return <Alert severity="info">Esta elección no tiene cargos registrados.</Alert>;
  }

  const current = positions[Math.min(index, positions.length - 1)];
  const go = (next: number) => setIndex((next + positions.length) % positions.length);

  return (
    <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderColor: "divider" }}>
      <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", mb: 2.5 }}>
        <IconButton aria-label="Cargo anterior" onClick={() => go(index - 1)} disabled={positions.length < 2}>
          <ChevronLeft />
        </IconButton>
        <Box sx={{ textAlign: "center" }}>
          <Typography variant="overline" color="text.secondary">
            {`Cargo ${index + 1} de ${positions.length}`}
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {current.positionName}
          </Typography>
        </Box>
        <IconButton aria-label="Cargo siguiente" onClick={() => go(index + 1)} disabled={positions.length < 2}>
          <ChevronRight />
        </IconButton>
      </Stack>

      <Fade key={`${current.electionPositionId}-${replay}`} in appear timeout={reducedMotion ? 0 : 350}>
        <Box>
          <PositionResultsSlide
            position={current}
            results={results}
            durationMs={duration}
            reducedMotion={reducedMotion}
          />
        </Box>
      </Fade>

      <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", mt: 3 }}>
        <Stack direction="row" spacing={1}>
          {positions.map((position, i) => (
            <Box
              key={position.electionPositionId}
              component="button"
              type="button"
              aria-label={`Ver ${position.positionName}`}
              aria-current={i === index ? "true" : undefined}
              onClick={() => setIndex(i)}
              sx={{
                width: i === index ? 24 : 10,
                height: 10,
                p: 0,
                border: 0,
                borderRadius: 5,
                cursor: "pointer",
                bgcolor: i === index ? "primary.main" : "action.disabled",
                transition: "width .25s ease",
              }}
            />
          ))}
        </Stack>
        <Button size="small" startIcon={<ReplayOutlined />} onClick={() => setReplay((r) => r + 1)}>
          Ver de nuevo
        </Button>
      </Stack>
    </Paper>
  );
}

export default ResultsCarousel;
