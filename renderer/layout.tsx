import React, { useState } from "react";
import { useNavigate } from "react-router";
import {
  styled,
  useTheme,
  Box,
  CssBaseline,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Tooltip,
} from "@mui/material";
import { AppBar as MuiAppBar, Drawer as MuiDrawer } from "@mui/material";
import {
  ChevronLeft as ChevronLeftIcon,
  Menu as MenuIcon,
  QueueMusic as PlaylistIcon,
  Album as AlbumIcon,
  Audiotrack as AudiotrackIcon,
  Description as CSVIcon,
  ArrowBack as BackIcon,
  Download as ImportIcon,
  Cached as ReloadIcon,
} from "@mui/icons-material";

const drawerWidth = 240;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(9)} + 1px)`,
  },
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }: { theme; open: boolean }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));

type LayoutProps = {
  children: React.ReactNode;
};
export default function Layout({ children }: LayoutProps) {
  const _theme = useTheme();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar position="fixed" open={open}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{
              marginRight: "36px",
              ...(open && { display: "none" }),
            }}>
            <MenuIcon />
          </IconButton>
          <Tooltip title="ひとつ前の画面に戻る">
            <IconButton onClick={() => history.back()}>
              <BackIcon color="inherit" />
            </IconButton>
          </Tooltip>
          <Typography variant="h6" noWrap component="div">
            Player
          </Typography>
          <Tooltip title="reload">
            <IconButton onClick={() => window.location.reload()}>
              <ReloadIcon color="inherit" />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>
      <Drawer variant="permanent" open={open}>
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose}>
            <ChevronLeftIcon />
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          <ListItemButton
            key={"Playlists"}
            onClick={() => navigate("/playlists")}>
            <ListItemIcon>
              <PlaylistIcon />
            </ListItemIcon>
            <ListItemText primary={"Playlists"} />
          </ListItemButton>
          <ListItemButton key={"Works"} onClick={() => navigate("/works")}>
            <ListItemIcon>
              <AlbumIcon />
            </ListItemIcon>
            <ListItemText primary={"Works"} />
          </ListItemButton>
          <ListItemButton key={"Tracks"} onClick={() => navigate("/tracks")}>
            <ListItemIcon>
              <AudiotrackIcon />
            </ListItemIcon>
            <ListItemText primary={"Tracks"} />
          </ListItemButton>
          <ListItemButton key={"CSVs"} onClick={() => navigate("/csvs")}>
            <ListItemIcon>
              <CSVIcon />
            </ListItemIcon>
            <ListItemText primary={"CSVs"} />
          </ListItemButton>
          <ListItemButton
            key={"Import"}
            onClick={() => navigate("/works/import")}>
            <ListItemIcon>
              <ImportIcon />
            </ListItemIcon>
            <ListItemText primary={"Import"} />
          </ListItemButton>
        </List>
        <Divider />
        <List></List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <DrawerHeader />
        {children}
      </Box>
    </Box>
  );
}
