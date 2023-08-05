import React, { FC, useState } from "react";
import {
  Search as SearchIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import { InputAdornment, TextField, IconButton } from "@mui/material";

type SearchFieldProps = {
  onChange: (text: string) => void;
};

export const SearchFiled: FC<SearchFieldProps> = ({ onChange }) => {
  const [searchText, setSearchText] = useState("");
  const handleChange = (text: string) => {
    setSearchText(text);
    onChange(text);
  };
  return (
    <TextField
      onChange={(e) => handleChange(e.target.value)}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        ),
        endAdornment: (
          <InputAdornment position="end">
            {searchText && (
              <IconButton onClick={() => handleChange("")}>
                <CancelIcon />
              </IconButton>
            )}
          </InputAdornment>
        ),
      }}
    />
  );
};
