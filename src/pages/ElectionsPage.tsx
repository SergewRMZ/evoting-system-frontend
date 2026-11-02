import { ShieldOutlined } from "@mui/icons-material";
import { Alert, Box, Paper, Stack, Typography } from "@mui/material";
import ElectionList from "../components/election/ElectionList";
import { PageHeader, PageLayout } from "../components/layout/PageLayout";
import useElections from "../hooks/election-service/useElections";
import { useKeycloak } from "../auth/useKeycloak";
import LoadingPage from "../components/LoadingPage";

const COPY = {
  admin: {
    eyebrow: "Administración",
    title: "Elecciones",
    description: "Todas las elecciones del sistema en cualquiera de sus etapas.",
    emptyTitle: "Aún no hay elecciones",
    emptyDescription: "Crea y configura una elección desde el panel de administración.",
  },
  authority: {
    eyebrow: "Autoridad electoral",
    title: "Revisión electoral",
    description: "Valida las elecciones publicadas, actívalas en su horario y contabiliza los votos al cierre.",
    emptyTitle: "No hay elecciones para revisar",
    emptyDescription: "Las elecciones aparecerán aquí cuando un administrador las publique.",
  },
  voter: {
    eyebrow: "Tu participación",
    title: "Elecciones",
    description: "Consulta las elecciones disponibles. Si una está activa, podrás emitir tu voto.",
    emptyTitle: "No hay elecciones disponibles",
    emptyDescription: "Las elecciones activas, cerradas o finalizadas aparecerán aquí.",
  },
};

function ElectionsPage() {
  const { elections: allElections, loading, error } = useElections();
  const { roles } = useKeycloak();
  const isAdmin = roles.includes("ROLE_ADMIN");
  const isAuthority = roles.includes("ROLE_AUTHORITY");
  const audience = isAdmin ? "admin" : isAuthority ? "authority" : "voter";
  const copy = COPY[audience];
  const elections = allElections.filter(({ status }) => {
    if (isAdmin) return true;
    if (isAuthority) return status !== "DRAFT";
    return status === "ACTIVE" || status === "CLOSED" || status === "FINISHED";
  });

  if (loading) return <LoadingPage message="Cargando elecciones disponibles..." />;

  return (
    <PageLayout>
      <PageHeader eyebrow={copy.eyebrow} title={copy.title} description={copy.description} />

      {error ? (
        <Alert severity="error">{error.message}</Alert>
      ) : elections.length === 0 ? (
        <Paper variant="outlined" sx={{ p: { xs: 3, md: 5 }, textAlign: "center" }}>
          <Typography variant="h6">{copy.emptyTitle}</Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>{copy.emptyDescription}</Typography>
        </Paper>
      ) : (
        <ElectionList elections={elections} linkTo={(election) => `/vote/${election.electionId}`} />
      )}

      {audience === "voter" && (
        <Stack direction="row" spacing={1.5} sx={{ mt: 4, alignItems: "flex-start", color: "text.secondary" }}>
          <ShieldOutlined fontSize="small" sx={{ mt: 0.25 }} />
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>Tu voto es solo tuyo</Typography>
            <Typography variant="body2" sx={{ mt: 0.25 }}>
              Iniciar sesión confirma que puedes participar. Tu boleta se cifra en tu dispositivo y nunca se asocia con tu identidad.
            </Typography>
          </Box>
        </Stack>
      )}
    </PageLayout>
  );
}

export default ElectionsPage;
