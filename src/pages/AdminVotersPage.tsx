import { useRef, useState, type ReactNode } from "react";
import { RefreshOutlined, SearchOutlined, WarningAmber } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  InputAdornment,
  LinearProgress,
  Paper,
  Snackbar,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { PageHeader, PageLayout } from "../components/layout/PageLayout";
import useVoterRegistrations from "../hooks/authentication-service/useVoterRegistrations";
import VoterReviewDialog from "../components/voters/VoterReviewDialog";
import VoterStatusChip from "../components/voters/VoterStatusChip";
import { formatDateTime, fullNameOf } from "../components/voters/voterFormat";
import type {
  VoterRegistration,
  VoterRegistrationStatus,
} from "../services/authentication-service/voters.types";

type Filter = VoterRegistrationStatus | "ALL";

const EMPTY_MESSAGES: Record<Filter, string> = {
  PENDING: "No hay solicitudes pendientes de revisión.",
  APPROVED: "Todavía no hay votantes aprobados.",
  ALL: "Aún no hay cuentas registradas.",
};

function Stat({ label, value, tone }: { label: string; value: ReactNode; tone: "warning.main" | "success.main" | "text.primary" }) {
  return (
    <Paper variant="outlined" sx={{ p: 2.5, flex: 1, minWidth: 0 }}>
      <Typography variant="body2" color="text.secondary">{label}</Typography>
      <Typography variant="h4" component="p" sx={{ mt: 0.5, color: tone }}>{value}</Typography>
    </Paper>
  );
}

/** Panel para revisar y aprobar los votantes que se registran desde Keycloak. */
function AdminVotersPage() {
  const [filter, setFilter] = useState<Filter>("PENDING");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [selected, setSelected] = useState<VoterRegistration | null>(null);
  const [notice, setNotice] = useState("");
  const searchTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const { data, loading, error, reload } = useVoterRegistrations({
    status: filter === "ALL" ? undefined : filter,
    search,
    page,
    size,
  });

  const onSearchChange = (value: string) => {
    setSearchInput(value);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setSearch(value);
      setPage(0);
    }, 300);
  };

  const handleApproved = (approved: VoterRegistration) => {
    setSelected(null);
    const name = fullNameOf(approved) || approved.username;
    setNotice(`${name} fue aprobado como votante.`);
    void reload();
  };

  const rows = data?.content ?? [];
  const total = data ? data.pendingCount + data.approvedCount : undefined;

  return (
    <PageLayout>
      <PageHeader
        eyebrow="Administración"
        title="Registro de votantes"
        description="Revisa las cuentas creadas desde el registro y aprueba como votantes a quienes tengan una matrícula válida."
        actions={
          <Button variant="outlined" startIcon={<RefreshOutlined />} onClick={() => void reload()} disabled={loading} sx={{ color: "text.primary" }}>
            Actualizar
          </Button>
        }
      />

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 3 }}>
        <Stat label="Pendientes de revisión" value={data?.pendingCount ?? "—"} tone="warning.main" />
        <Stat label="Votantes aprobados" value={data?.approvedCount ?? "—"} tone="success.main" />
        <Stat label="Cuentas registradas" value={total ?? "—"} tone="text.primary" />
      </Stack>

      <Paper variant="outlined" sx={{ overflow: "hidden" }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          sx={{ px: 2, pt: 1, pb: { xs: 2, md: 1 }, alignItems: { md: "center" }, justifyContent: "space-between", borderBottom: 1, borderColor: "divider" }}
        >
          <Tabs
            value={filter}
            onChange={(_, value: Filter) => { setFilter(value); setPage(0); }}
            aria-label="Filtrar por estado"
            variant="scrollable"
            scrollButtons={false}
          >
            <Tab value="PENDING" label={`Pendientes${data ? ` · ${data.pendingCount}` : ""}`} />
            <Tab value="APPROVED" label={`Aprobados${data ? ` · ${data.approvedCount}` : ""}`} />
            <Tab value="ALL" label="Todos" />
          </Tabs>
          <TextField
            size="small"
            placeholder="Buscar por matrícula, nombre o correo"
            value={searchInput}
            onChange={(event) => onSearchChange(event.target.value)}
            sx={{ width: { xs: "100%", md: 320 } }}
            slotProps={{
              htmlInput: { "aria-label": "Buscar votantes" },
              input: { startAdornment: <InputAdornment position="start"><SearchOutlined fontSize="small" /></InputAdornment> },
            }}
          />
        </Stack>

        <Box sx={{ height: 2 }}>{loading && <LinearProgress sx={{ height: 2, borderRadius: 0 }} aria-label="Cargando registros" />}</Box>

        {error ? (
          <Alert severity="error" sx={{ m: 2 }} action={<Button color="inherit" size="small" onClick={() => void reload()}>Reintentar</Button>}>
            {error}
          </Alert>
        ) : !loading && rows.length === 0 ? (
          <Box sx={{ py: 8, px: 2, textAlign: "center" }}>
            <Typography color="text.secondary">
              {search ? `No hay resultados para «${search}».` : EMPTY_MESSAGES[filter]}
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table size="medium" sx={{ minWidth: 720 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Matrícula</TableCell>
                  <TableCell>Correo</TableCell>
                  <TableCell>Registro</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell align="right"><Box component="span" sx={visuallyHidden}>Acciones</Box></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.userId} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>{fullNameOf(row) || "Sin nombre"}</Typography>
                      <Typography variant="caption" color="text.secondary">{row.username}</Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
                        <Box component="span" sx={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: "0.8125rem" }}>
                          {row.matricula ?? "—"}
                        </Box>
                        {!row.matriculaValid && (
                          <Tooltip title="Matrícula ausente o inválida">
                            <WarningAmber color="error" sx={{ fontSize: 16 }} aria-label="Matrícula inválida" />
                          </Tooltip>
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{row.email ?? "—"}</Typography>
                      {row.email && !row.emailVerified && (
                        <Typography variant="caption" color="text.secondary">Sin verificar</Typography>
                      )}
                    </TableCell>
                    <TableCell><Typography variant="body2" color="text.secondary">{formatDateTime(row.registeredAt)}</Typography></TableCell>
                    <TableCell><VoterStatusChip registration={row} /></TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        variant={row.status === "PENDING" ? "contained" : "text"}
                        onClick={() => setSelected(row)}
                        sx={row.status === "PENDING" ? undefined : { color: "text.secondary" }}
                      >
                        {row.status === "PENDING" ? "Revisar" : "Ver"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {data && data.totalElements > 0 && (
          <TablePagination
            component="div"
            count={data.totalElements}
            page={page}
            rowsPerPage={size}
            onPageChange={(_, value) => setPage(value)}
            onRowsPerPageChange={(event) => { setSize(Number(event.target.value)); setPage(0); }}
            rowsPerPageOptions={[10, 20, 50]}
            labelRowsPerPage="Por página"
            labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
            sx={{ borderTop: 1, borderColor: "divider" }}
          />
        )}
      </Paper>

      <VoterReviewDialog
        registration={selected}
        onClose={() => setSelected(null)}
        onApproved={handleApproved}
        onStale={() => void reload()}
      />

      <Snackbar
        open={Boolean(notice)}
        autoHideDuration={5000}
        onClose={() => setNotice("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" variant="filled" onClose={() => setNotice("")} sx={{ width: "100%" }}>
          {notice}
        </Alert>
      </Snackbar>
    </PageLayout>
  );
}

const visuallyHidden = {
  border: 0,
  clip: "rect(0 0 0 0)",
  height: 1,
  margin: -1,
  overflow: "hidden",
  padding: 0,
  position: "absolute" as const,
  whiteSpace: "nowrap" as const,
  width: 1,
};

export default AdminVotersPage;
