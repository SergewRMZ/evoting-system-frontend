import { useState } from "react";
import {
  ArrowBack,
  HowToVoteOutlined,
  InfoOutlined,
  LockOutlined,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { Link as RouterLink, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import ElectionSummary from "../components/voting/ElectionSummary";
import PositionSection from "../components/voting/PositionSection";
import LoadingPage from "../components/LoadingPage";
import { blindVote, createVotePayload, encryptVote } from "../utils/voting/vote.utils";
import useVotingData from "../hooks/useVotingData";
import { canonicalize } from "json-canonicalize";
import { arrayUint8ArrayToBase64, sha384 } from "../crypto/crypto.utils";
import type { VotePayload } from "../types/vote.types";
import { JsBlindResult } from "../crypto/rsa-bssa/rsa_bssa";
import useAuthorization from "../hooks/authorization-service/useAuthorization";

function VotePage() {
    const { electionId } = useParams<{ electionId: string }>();
    const { election, encryptionPublicKey, authorizationPublicKey, loading, error } = useVotingData(electionId);
    const { requestBlindSignature, loading: loadingBlindSignature } = useAuthorization();
    const [ selectedCandidacies, setSelectedCandidacies ] = 
        useState<Record<string, string>>({});

    const [submissionMessage, setSubmissionMessage] = 
        useState<string | null>(null);

    const [blindResult, setBlindResult] = 
        useState<JsBlindResult | null>(null);

    const [voteDigest, setVoteDigest] = 
        useState<Uint8Array | null>(null);

    if (loading || loadingBlindSignature) return <LoadingPage/>
    if (error || !election || !encryptionPublicKey) {
        return (
        <Box
            sx={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
            }}
        >
            <Alert severity="error">
                No se pudo cargar la información de la elección.
            </Alert>
        </Box>
        
        )
    }
    const selectedElection = election;

    function selectCandidacy(electionPositionId: string, candidacyId: string) {
        setSubmissionMessage(null);
        setSelectedCandidacies((current) => ({
        ...current,
        [electionPositionId]: candidacyId,
        }));
    }

    const prepareVoteSubmission = async () => {
        const votePayload: VotePayload = createVotePayload(selectedElection, selectedCandidacies);
        const encryptedVote: string = canonicalize(encryptVote(votePayload, encryptionPublicKey!));
        const digest: Uint8Array = await sha384(encryptedVote);
        const blindedVote: JsBlindResult = await blindVote(digest, authorizationPublicKey!);
        setBlindResult(blindedVote);
        setVoteDigest(digest);

        const blindedMessageB64 = arrayUint8ArrayToBase64(blindedVote.blinded_message);
        const response = await requestBlindSignature(election.electionId, blindedMessageB64);
        console.log("Firma ciega: ", response);
    }

    const selectedCount = Object.keys(selectedCandidacies).length;

    return (
        <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
        <Navbar />

        <Container component="main" maxWidth="lg" sx={{ py: { xs: 3, md: 6 } }}>
            <Button
            component={RouterLink}
            to="/vote"
            startIcon={<ArrowBack />}
            sx={{ mb: 3, color: "text.secondary" }}
            >
            Volver a elecciones
            </Button>

            <ElectionSummary election={election!} />

            <Alert
            icon={<InfoOutlined />}
            severity="info"
            sx={{
                mb: 3,
                border: "1px solid rgba(155,138,251,.22)",
                bgcolor: "rgba(155,138,251,.07)",
                fontSize: "1.2rem",
                color: "text.primary",
                "& .MuiAlert-icon": { color: "primary.main" },
            }}
            >
            
            Tu identidad se usa para validar tu participación en el proceso. Selecciona el candidato de tu preferencia para cada posición electoral y prepara tu voto.
            </Alert>

            <Stack
            direction={{ xs: "column", sm: "row" }}
            sx={{
                mb: 2,
                justifyContent: "space-between",
                alignItems: { sm: "center" },
            }}
            >
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Puestos de elección
            </Typography>
            <Typography variant="body2" color="text.secondary">
                {selectedCount} de {election.positions.length} con selección
            </Typography>
            </Stack>

            <Stack spacing={2}>
            {election.positions.map((position) => (
                <PositionSection
                key={position.electionPositionId}
                position={position}
                selectedCandidateId={
                    selectedCandidacies[position.electionPositionId]
                }
                onCandidacySelect={selectCandidacy}
                />
            ))}
            </Stack>

            <Paper
            variant="outlined"
            sx={{
                mt: 3,
                p: { xs: 2.5, md: 3 },
                borderColor: "divider",
                bgcolor: "rgba(255,255,255,.02)",
            }}
            >
            <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}
            >
                <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                <LockOutlined sx={{ color: "secondary.main" }} />
                <Box>
                    <Typography sx={{ fontWeight: 700 }}>
                    ¿Listo para preparar tu voto?
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Puedes cambiar tus selecciones antes de continuar.
                    </Typography>
                </Box>
                </Stack>
                <Button
                variant="contained"
                size="large"
                startIcon={<HowToVoteOutlined />}
                onClick={prepareVoteSubmission}
                sx={{ px: 3, whiteSpace: "nowrap" }}
                >
                Preparar voto
                </Button>
            </Stack>
            {submissionMessage && (
                <Alert
                severity={submissionMessage.startsWith("No se encontró") ? "error" : "success"}
                sx={{ mt: 2 }}
                >
                {submissionMessage}
                </Alert>
            )}
            </Paper>
            <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mt: 2, textAlign: "center" }}
            >
            Esta demostración solo prepara e imprime los datos. No se conecta a
            ningún servicio de votación.
            </Typography>
        </Container>
        </Box>
    );
}

export default VotePage;
