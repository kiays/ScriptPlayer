import {
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Paper,
  Slider,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState } from "react";

const Settings = () => {
  const handleChange = (e) => {
    console.log(e.target.name, e.target.value, e.target.type);
    if (e.target.type === "checkbox") {
      setState({ ...state, [e.target.name]: e.target.checked });
    } else {
      setState({ ...state, [e.target.name]: e.target.value });
    }
  };

  const [state, setState] = useState({
    path: "",
    defaultUfoScale: 1.0,
    autoReconnect: true,
  });

  console.log(state);
  return (
    <Paper sx={{ padding: 2 }}>
      <Typography variant="h4" component="h1" sx={{ my: 2 }}>
        Settings
      </Typography>
      <FormControl component="fieldset" variant="standard" sx={{}}>
        <FormLabel component="legend" sx={{ mt: 4 }}>
          UFO関連設定
        </FormLabel>
        <FormGroup>
          <FormControlLabel
            control={
              <Switch
                value={state.autoReconnect}
                onChange={handleChange}
                name="autoReconnect"
              />
            }
            label="切断時の自動再接続"
          />
          <FormControlLabel
            control={
              <>
                <Slider
                  aria-label="Volume"
                  value={state.defaultUfoScale}
                  onChange={handleChange}
                  name="defaultUfoScale"
                  min={0.01}
                  step={0.01}
                  max={1.5}
                />
                {state.defaultUfoScale}
              </>
            }
            label="UFOのデフォルトの強さ"
          />
        </FormGroup>
        <FormLabel component="legend" sx={{ mt: 4 }}>
          音声作品設定
        </FormLabel>
        <FormGroup>
          <FormControlLabel
            control={
              <TextField
                value={state.path}
                type="text"
                inputProps={{ webkitdirectory: true }}
                onChange={handleChange}
                name="path"
              />
            }
            label="音声作品の保存先"
          />
        </FormGroup>
      </FormControl>
    </Paper>
  );
};

export default Settings;
