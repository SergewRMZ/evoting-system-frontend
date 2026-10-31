import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Box, Typography, useTheme } from "@mui/material";
import type { ElectionTallyResult } from "../../services/tally-service/tally-service.types";
import type { ElectionPosition } from "../../services/election-service/election.types";

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

interface PositionResultChartProps {
  position: ElectionPosition;
  results: ElectionTallyResult[];
}

interface ChartDataEntry {
  name: string;
  votos: number;
}

// Paleta de colores accesible para las barras
const BAR_COLORS = [
  "#7c6af7",
  "#4fc3f7",
  "#81c784",
  "#ffb74d",
  "#f06292",
  "#a1887f",
  "#90a4ae",
];

// ---------------------------------------------------------------------------
// Tooltip personalizado
// ---------------------------------------------------------------------------

interface CustomTooltipProps {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        px: 2,
        py: 1,
        boxShadow: 3,
      }}
    >
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography sx={{ fontWeight: 700 }}>
        {payload[0].value} votos
      </Typography>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Componente de gráfica por cargo
// ---------------------------------------------------------------------------

/**
 * Gráfica de barras horizontales para los resultados de un cargo electoral.
 */
function PositionResultChart({ position, results }: PositionResultChartProps) {
  const theme = useTheme();

  // Combinar resultados del backend con datos de candidatura
  const chartData: ChartDataEntry[] = position.candidacies
    .map((candidacy) => {
      const match = results.find(
        (r) =>
          r.candidacyId === candidacy.candidacyId &&
          r.electionPositionId === position.electionPositionId
      );
      return {
        name: `${candidacy.candidate.name} ${candidacy.candidate.lastName}`,
        votos: match?.result ?? 0,
      };
    })
    .sort((a, b) => b.votos - a.votos);

  const maxVotos = Math.max(...chartData.map((d) => d.votos), 1);

  return (
    <Box>
      <Typography
        variant="overline"
        color="secondary.main"
        sx={{ letterSpacing: ".08em" }}
      >
        {position.positionName}
      </Typography>

      {chartData.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          No hay datos de resultados para este cargo.
        </Typography>
      ) : (
        <ResponsiveContainer width="100%" height={Math.max(120, chartData.length * 52)}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 8, right: 40, left: 0, bottom: 8 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              horizontal={false}
              stroke={
                theme.palette.mode === "dark"
                  ? "rgba(255,255,255,.08)"
                  : "rgba(0,0,0,.08)"
              }
            />
            <XAxis
              type="number"
              domain={[0, maxVotos]}
              tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
              allowDecimals={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={160}
              tick={{ fontSize: 12, fill: theme.palette.text.primary }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,.04)" }} />
            <Bar dataKey="votos" radius={[0, 4, 4, 0]}>
              {chartData.map((_, index) => (
                <Cell
                  key={index}
                  fill={BAR_COLORS[index % BAR_COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </Box>
  );
}

export default PositionResultChart;

