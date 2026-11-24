import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  ArrowBack,
  Search,
  VisibilityOutlined,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Pagination,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { Link as RouterLink, useParams, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import VoteVerificationPanel from "../components/voting/VoteVerificationPanel";
import { useKeycloak } from "../auth/useKeycloak";
import LoadingPage from "../components/LoadingPage";
import bulletinBoardServiceApi from "../services/bulletin-board-service/bulletin-board.api";
import type {
  BulletinBoardPage as BulletinBoardPageData,
  BulletinBoardVote,
} from "../services/bulletin-board-service/bulletin-board.types";
import { getApiErrorMessage } from "../errors/apiErrorMap";
import { canonicalize } from "json-canonicalize";
import { sha3_384Hash, Uint8ArrayToBase64 } from "../crypto/crypto.utils";

const PAGE_SIZE = 10;

function truncateValue(value: string | undefined, visibleCharacters = 18) {
  if (!value) return "No disponible";
  if (value.length <= visibleCharacters * 2) return value;
  return `${value.slice(0, visibleCharacters)}…${value.slice(-visibleCharacters)}`;
}

async function getVoteDigest(vote: BulletinBoardVote): Promise<string> {
  if (vote.digest) return vote.digest;
  const digest = await sha3_384Hash(canonicalize(vote.encryptedVote));
  return Uint8ArrayToBase64(digest);
}

function BulletinBoardPage() {
  const { electionId } = useParams<{ electionId: string }>();
  // El tablón es público; el regreso al detalle solo aplica con sesión iniciada.
  const { authenticated } = useKeycloak();
  // El comprobante enlaza al tablón con ?voteId=..., para buscar el voto al abrirlo.
  const [searchParams] = useSearchParams();
  const initialVoteId = searchParams.get("voteId")?.trim() ?? "";
  const [pageNumber, setPageNumber] = useState(0);
  const [pageData, setPageData] = useState<BulletinBoardPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadedPage, setLoadedPage] = useState(-1);
  const [error, setError] = useState("");
  const [voteIdInput, setVoteIdInput] = useState(initialVoteId);
  const [searchedVote, setSearchedVote] = useState<BulletinBoardVote | null>(null);
  const [searchError, setSearchError] = useState("");
  const [searching, setSearching] = useState(false);
  const [selectedVote, setSelectedVote] = useState<BulletinBoardVote | null>(null);
  const [voteDigests, setVoteDigests] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!electionId) {
      return;
    }

    let active = true;
    bulletinBoardServiceApi.getVotes(electionId, pageNumber, PAGE_SIZE)
      .then(async (data) => {
        const digestEntries = await Promise.all(data.content.map(async (vote) => [
          vote.voteId,
          await getVoteDigest(vote),
        ] as const));
        if (active) {
          setVoteDigests((current) => ({ ...current, ...Object.fromEntries(digestEntries) }));
          setPageData(data);
          setError("");
        }
      })
      .catch((loadError: unknown) => {
        if (active) setError(getApiErrorMessage(loadError, "bulletin-board", "No se pudo cargar el tablón público."));
      })
      .finally(() => {
        if (active) {
          setLoading(false);
          setLoadedPage(pageNumber);
        }
      });

    return () => {
      active = false;
    };
  }, [electionId, pageNumber]);

  const searchVote = async (voteId: string) => {
    if (!electionId || !voteId) return;
    setSearching(true);
    setSearchError("");
    setSearchedVote(null);
    try {
      const result = await bulletinBoardServiceApi.findVote(electionId, voteId);
      const foundVote = result.vote;
      if (foundVote) {
        const digest = await getVoteDigest(foundVote);
        setVoteDigests((current) => ({ ...current, [foundVote.voteId]: digest }));
        setSearchedVote(foundVote);
        setSearchError("");
      } else {
        setSearchError("No se encontró un registro con ese identificador.");
      }
    } catch (searchFailure) {
      setSearchError(getApiErrorMessage(searchFailure, "bulletin-board", "No se pudo buscar el registro."));
    } finally {
      setSearching(false);
    }
  };

  // Sin preventDefault, el navegador envía el formulario y recarga la página,
  // lo que pierde la sesión de Keycloak y regresa al inicio de sesión.
  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void searchVote(voteIdInput.trim());
  };

  const searchedInitialVote = useRef(false);
  useEffect(() => {
    if (searchedInitialVote.current || !initialVoteId) return;
    searchedInitialVote.current = true;
    void searchVote(initialVoteId);
    // Solo al abrir la página desde el enlace del comprobante.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialVoteId]);

  const isLoading = Boolean(electionId) && (loading || loadedPage !== pageNumber);
  if (isLoading && !pageData) return <LoadingPage message="Consultando votos registrados..." />;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Navbar />
      <Container component="main" maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        {authenticated && (
          <Button component={RouterLink} to={`/vote/${electionId ?? ""}`} size="small" startIcon={<ArrowBack fontSize="small" />} sx={{ mb: 2, ml: -1, color: "text.secondary" }}>
            Volver al detalle
          </Button>
        )}
        <Typography variant="overline" color="secondary.main">REGISTRO PÚBLICO</Typography>
        <Typography variant="h4" component="h1" sx={{ fontSize: { xs: "1.625rem", md: "2rem" }, mt: 0.5 }}>
          Tablón de anuncios
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1, mb: 3 }}>
          Votos cifrados registrados en esta elección. Los datos publicados no revelan la selección en texto claro.
        </Typography>

        <Paper component="form" onSubmit={handleSearchSubmit} variant="outlined" sx={{ p: 2, borderColor: "divider", mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
            Consulta tu voto con el identificador de tu comprobante y verifica su firma digital.
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <TextField
              label="Identificador del voto"
              value={voteIdInput}
              onChange={(event) => setVoteIdInput(event.target.value)}
              fullWidth
            />
            <Button type="submit" variant="contained" startIcon={<Search />} disabled={searching || !voteIdInput.trim()} sx={{ minWidth: 150 }}>
              {searching ? "Buscando..." : "Buscar registro"}
            </Button>
          </Stack>
          {searchError && <Alert severity={searchedVote ? "info" : "warning"} sx={{ mt: 1.5 }}>{searchError}</Alert>}
        </Paper>

        {(error || !electionId) && <Alert severity="error" sx={{ mb: 2 }}>{error || "No se proporcionó el identificador de la elección."}</Alert>}
        {searchedVote && electionId && (
          <Paper variant="outlined" sx={{ p: 2.5, mb: 3, borderColor: "primary.main" }}>
            <Stack spacing={2}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ alignItems: { sm: "center" }, justifyContent: "space-between" }}>
                <Box>
                  <Typography variant="overline" color="primary.main">VOTO ENCONTRADO</Typography>
                  <Typography sx={{ fontFamily: "monospace", overflowWrap: "anywhere" }}>{searchedVote.voteId}</Typography>
                </Box>
                <Button variant="text" startIcon={<VisibilityOutlined />} onClick={() => setSelectedVote(searchedVote)}>
                  Ver voto cifrado
                </Button>
              </Stack>
              <Box>
                <Typography variant="caption" color="text.secondary">Digesto del voto cifrado (SHA3-384)</Typography>
                <Typography sx={{ fontFamily: "monospace", overflowWrap: "anywhere" }}>
                  {voteDigests[searchedVote.voteId] ?? "Calculando digesto…"}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Firma digital</Typography>
                <Typography sx={{ fontFamily: "monospace", overflowWrap: "anywhere" }}>{truncateValue(searchedVote.signature, 32)}</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Tu selección permanece cifrada: el tablón solo permite comprobar que tu voto fue registrado y que está autorizado.
              </Typography>
              <VoteVerificationPanel key={searchedVote.voteId} electionId={electionId} vote={searchedVote} />
            </Stack>
          </Paper>
        )}

        <TableContainer component={Paper} variant="outlined" sx={{ borderColor: "divider" }}>
          <Table aria-label="Votos cifrados registrados" sx={{ minWidth: 760 }}>
            <TableHead>
              <TableRow>
                <TableCell>Identificador del voto</TableCell>
                <TableCell>Digest</TableCell>
                <TableCell>Firma digital</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={4}>Actualizando registros…</TableCell></TableRow>
              ) : pageData?.content.length ? pageData.content.map((vote) => (
                <TableRow key={vote.voteId} hover>
                  <TableCell sx={{ fontFamily: "monospace", overflowWrap: "anywhere" }}>{vote.voteId}</TableCell>
                  <TableCell sx={{ fontFamily: "monospace" }}>{truncateValue(voteDigests[vote.voteId] ?? vote.digest)}</TableCell>
                  <TableCell sx={{ fontFamily: "monospace" }}>{truncateValue(vote.signature)}</TableCell>
                  <TableCell align="right">
                    <Button size="small" startIcon={<VisibilityOutlined />} onClick={() => setSelectedVote(vote)}>
                      Ver detalle
                    </Button>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow><TableCell colSpan={4} align="center">No hay votos registrados en esta página.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ alignItems: "center", justifyContent: "space-between", mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {pageData?.totalElements ?? 0} registros · página {pageData && pageData.totalPages > 0 ? pageNumber + 1 : 0} de {pageData?.totalPages ?? 0}
          </Typography>
          <Pagination
            count={Math.max(1, pageData?.totalPages ?? 1)}
            page={pageNumber + 1}
            onChange={(_, value) => setPageNumber(value - 1)}
            disabled={!pageData?.totalPages || isLoading}
            color="primary"
            aria-label="Paginación del tablón"
          />
        </Stack>
      </Container>

      <Dialog open={Boolean(selectedVote)} onClose={() => setSelectedVote(null)} fullWidth maxWidth="md">
        <DialogTitle>Detalle del registro cifrado</DialogTitle>
        <DialogContent dividers>
          {selectedVote && (
            <Stack spacing={2}>
              <Box>
                <Typography variant="caption" color="text.secondary">Identificador</Typography>
                <Typography sx={{ fontFamily: "monospace", overflowWrap: "anywhere" }}>{selectedVote.voteId}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Voto cifrado</Typography>
                <Box component="pre" sx={{ p: 2, mt: 1, maxHeight: 360, overflow: "auto", bgcolor: "background.default", borderRadius: 2, fontSize: "0.75rem", whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
                  {JSON.stringify(selectedVote.encryptedVote, null, 2)}
                </Box>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Digest</Typography>
                <Typography sx={{ fontFamily: "monospace", overflowWrap: "anywhere" }}>
                  {voteDigests[selectedVote.voteId] ?? selectedVote.digest ?? "Calculando digest…"}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Factor aleatorio: <Box component="span" sx={{ fontFamily: "monospace", overflowWrap: "anywhere" }}>{selectedVote.randomizer}</Box>
              </Typography>
              <Box>
                <Typography variant="caption" color="text.secondary">Firma digital completa</Typography>
                <Box component="pre" sx={{ p: 2, mt: 1, maxHeight: 220, overflow: "auto", bgcolor: "background.default", borderRadius: 2, fontSize: "0.75rem", whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
                  {selectedVote.signature}
                </Box>
              </Box>
              {electionId && <VoteVerificationPanel key={selectedVote.voteId} electionId={electionId} vote={selectedVote} />}
            </Stack>
          )}
        </DialogContent>
        <DialogActions><Button onClick={() => setSelectedVote(null)}>Cerrar</Button></DialogActions>
      </Dialog>
    </Box>
  );
}

export default BulletinBoardPage;
