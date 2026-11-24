import { useState } from "react";
import { VerifiedUserOutlined } from "@mui/icons-material";
import { Alert, Box, Button, Stack, Typography } from "@mui/material";
import authorizationServiceApi from "../../services/authorization-service/authorization.api";
import type { BulletinBoardVote } from "../../services/bulletin-board-service/bulletin-board.types";
import { getApiErrorMessage } from "../../errors/apiErrorMap";
import { verifyBulletinVote, type VoteVerificationResult } from "../../utils/voting/voteVerification";

type Props = {
  electionId: string;
  vote: BulletinBoardVote;
};

/**
 * Verifica en el navegador la firma digital de un voto del tablón: recalcula el
 * digesto del voto cifrado y comprueba la firma RSA-PSS con la clave pública de
 * autorización de la elección.
 */
function VoteVerificationPanel({ electionId, vote }: Props) {
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<VoteVerificationResult | null>(null);
  const [error, setError] = useState("");

  const verify = async () => {
    setVerifying(true);
    setError("");
    setResult(null);
    try {
      const authorizationKey = await authorizationServiceApi.getPublicKey(electionId);
      setResult(await verifyBulletinVote(vote, authorizationKey));
    } catch (verificationError) {
      setError(getApiErrorMessage(
        verificationError,
        "authorization",
        "No se pudo obtener la clave pública de la elección para verificar la firma.",
      ));
    } finally {
      setVerifying(false);
    }
  };

  const valid = result?.signatureValid && result.keyMatches;

  return (
    <Box>
      <Button
        variant="outlined"
        startIcon={<VerifiedUserOutlined />}
        onClick={() => void verify()}
        disabled={verifying}
      >
        {verifying ? "Verificando firma..." : "Verificar firma digital"}
      </Button>

      {error && <Alert severity="error" sx={{ mt: 1.5 }}>{error}</Alert>}

      {result && (
        <Alert severity={valid ? "success" : "error"} sx={{ mt: 1.5 }}>
          <Typography variant="subtitle2" component="p">
            {valid
              ? "La firma digital es válida: el voto fue autorizado por el servicio de autorización y no ha sido alterado."
              : "La firma digital no es válida para este voto."}
          </Typography>
          <Stack component="ul" spacing={0.5} sx={{ mt: 1, mb: 0, pl: 2.5 }}>
            <Typography component="li" variant="body2">
              Clave de autorización de la elección: {result.keyMatches ? "coincide" : "no coincide"}.
            </Typography>
            <Typography component="li" variant="body2">
              Firma RSA-PSS sobre el digesto del voto: {result.signatureValid ? "válida" : "inválida"}.
            </Typography>
            <Typography component="li" variant="body2">
              Digesto calculado (SHA3-384):{" "}
              <Box component="span" sx={{ fontFamily: "monospace", overflowWrap: "anywhere" }}>{result.digest}</Box>
            </Typography>
          </Stack>
          {valid && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              Compara el digesto con el de tu comprobante: si coinciden, este es tu voto.
            </Typography>
          )}
        </Alert>
      )}
    </Box>
  );
}

export default VoteVerificationPanel;
