import { MenuItem, Select } from "@mui/material";
import { ALL_ADDITIONAL_FIELDS, Field, FormData } from "./Form";
import { UseFieldArrayAppend } from "react-hook-form";

const CLOSE_SELECT = "close_select";

type SelectAdditionalFieldProps = {
  availableFields: Field[];
  setIsAddingField: (bool: boolean) => void;
  append: UseFieldArrayAppend<FormData, never>;
  updateFees: (action: "add", field: Field) => void;
};

export const SelectAdditionalField = ({
  availableFields,
  setIsAddingField,
  append,
  updateFees,
}: SelectAdditionalFieldProps) => {
  return (
    <Select
      fullWidth
      displayEmpty
      defaultValue=""
      renderValue={() => (
        <span style={{ color: "rgba(255, 255, 255, .7)" }}>
          {"Choose field"}
        </span>
      )}
      onChange={(e) => {
        const value = e.target.value;

        if (value === CLOSE_SELECT) {
          setIsAddingField(false);
          return;
        }

        const field = ALL_ADDITIONAL_FIELDS.find((f) => f.name === value)!;
        append(field);
        updateFees("add", field);
        setIsAddingField(false);
      }}
    >
      <MenuItem key="closeSelect" value={CLOSE_SELECT}>
        -
      </MenuItem>
      {availableFields.map((f) => (
        <MenuItem key={f.name} value={f.name}>
          {f.label}
        </MenuItem>
      ))}
    </Select>
  );
};
