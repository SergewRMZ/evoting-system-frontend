import { useState } from "react";
import { CheckOutlined, ContentCopyOutlined } from "@mui/icons-material";
import { Box, Grid, IconButton, Paper, Tooltip, Typography } from "@mui/material";

type SignatureBoxProps = {
  title: string;
  description: string;
  value?: string;
};

function SignatureBox({ title, description, value }: SignatureBoxProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Sin permiso de portapapeles: el valor sigue visible para copiarlo a mano.
    }
  };

  return (
    <Paper variant="outlined" sx={{ p: 2, height: "100%", display: "flex", flexDirection: "column" }}>
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1 }}>
        <Box>
          <Typography sx={{ fontWeight: 700 }}>{title}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {description}
          </Typography>
        </Box>
        {value && (
          <Tooltip title={copied ? "Copiada" : "Copiar"}>
            <IconButton size="small" onClick={() => void copy()} aria-label={`Copiar ${title.toLowerCase()}`}>
              {copied ? <CheckOutlined fontSize="small" /> : <ContentCopyOutlined fontSize="small" />}
            </IconButton>
          </Tooltip>
        )}
      </Box>
      <Box
        component="pre"
        sx={{
          mt: 1.5,
          mb: 0,
          p: 1.5,
          flex: 1,
          maxHeight: 180,
          overflow: "auto",
          bgcolor: "action.hover",
          borderRadius: 1,
          fontFamily: "monospace",
          fontSize: 12,
          whiteSpace: "pre-wrap",
          wordBreak: "break-all",
        }}
      >
        {value ?? "Esperando la autorización..."}
      </Box>
    </Paper>
  );
}

type SignaturePanelProps = {
  blindSignature?: string;
  signature?: string;
};

/**
 * Muestra lado a lado la firma ciega que emitió el servicio de autorización y la
 * firma válida que obtuvo el navegador al quitarle el cegado.
 */
function SignaturePanel({ blindSignature, signature }: SignaturePanelProps) {
  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 6 }}>
        <SignatureBox
          title="Firma digital ciega"
          description="Emitida por el servicio de autorización sobre tu voto cegado. El servicio nunca vio el contenido de tu voto."
          value={blindSignature}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <SignatureBox
          title="Firma digital válida"
          description="Obtenida en tu navegador al quitar el cegado. Es la que acompaña a tu voto en la urna digital."
          value={signature}
        />
      </Grid>
    </Grid>
  );
}

export default SignaturePanel;
