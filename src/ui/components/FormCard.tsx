import { Card, CardContent } from "@mui/material";
import { PropsWithChildren } from "react";

interface FormCardProps extends PropsWithChildren {
  onClick: VoidFunction;
  isSelected: boolean;
}

export const FormCard = ({ onClick, isSelected, children }: FormCardProps) => {
  return (
    <Card
      className={`w-full mb-8 cursor-pointer ${
        isSelected ? `border-2 border-[#deff00]` : ""
      }`}
      variant="elevation"
      onClick={onClick}
    >
      <CardContent>{children}</CardContent>
    </Card>
  );
};
