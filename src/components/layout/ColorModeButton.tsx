import { useContext } from "react";
import { DarkModeOutlined, LightModeOutlined } from "@mui/icons-material";
import { IconButton, Tooltip } from "@mui/material";
import { ColorModeContext } from "../../theme/ColorModeContext";

function ColorModeButton() {
  const { mode, toggleColorMode } = useContext(ColorModeContext);
  const label = mode === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro";
  return (
    <Tooltip title={label}>
      <IconButton onClick={toggleColorMode} aria-label={label} size="small" sx={{ color: "text.secondary" }}>
        {mode === "dark" ? <LightModeOutlined fontSize="small" /> : <DarkModeOutlined fontSize="small" />}
      </IconButton>
    </Tooltip>
  );
}

export default ColorModeButton;
