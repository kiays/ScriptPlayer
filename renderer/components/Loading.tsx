import { Backdrop, CircularProgress } from "@mui/material";
import React from "react";

const Loading = ({ loading }: { loading: boolean }) =>
  loading ? (
    <Backdrop
      sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
      open={true}>
      <CircularProgress color="inherit" />
    </Backdrop>
  ) : null;

export default Loading;
