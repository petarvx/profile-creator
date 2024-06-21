import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Divider,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { Fee, Fees } from "./PageForm";

type FeeProps = {
  fees: Fees;
  totalFee: number;
};

const FeeRow = ({ label, fee, className }: Fee & { className: string }) => (
  <Box className={className}>
    <Typography className="text-sm md:text-base">{label}:</Typography>
    <Typography className="text-sm md:text-base">$ {fee.toFixed(2)}</Typography>
  </Box>
);

export const FeeBreakdownLarge = ({ fees, totalFee }: FeeProps) => {
  return (
    <Box className="border-2 border-primary p-6 h-fit md:mt-16">
      <Typography variant="h5" className="mb-4">
        Fee
      </Typography>

      {fees.map(({ label, fee }) => (
        <Box key={label}>
          <Divider className="my-2" />
          <FeeRow
            label={label}
            fee={fee}
            className="flex justify-between w-[150px]"
          />
        </Box>
      ))}

      <Divider className="mt-4" />

      <Box className="flex justify-between w-[150px]">
        <Typography className="font-bold">Total:</Typography>
        <Typography className="text-primary">
          $ {totalFee.toFixed(2)}
        </Typography>
      </Box>
    </Box>
  );
};

export const FeeBreakdownMobile = ({ fees, totalFee }: FeeProps) => {
  return (
    <Accordion
      disableGutters
      square
      className="bg-primary text-black absolute bottom-0 left-0 right-0"
    >
      <AccordionSummary className="flex justify-between items-center">
        <Box className="flex justify-between w-full">
          <Typography className="font-bold block text-base">
            Total fee:
          </Typography>
          <Typography className="text-base block">
            $ {totalFee.toFixed(2)}
          </Typography>
        </Box>
      </AccordionSummary>

      <AccordionDetails>
        <Divider color="black" />

        {fees.map(({ label, fee }) => (
          <Box key={label}>
            <FeeRow label={label} fee={fee} className="flex justify-between" />
          </Box>
        ))}
      </AccordionDetails>
    </Accordion>
  );
};

export const FeeBreakdown = ({ fees, totalFee }: FeeProps) => {
  const isLarge = useMediaQuery("(min-width:600px)");

  return isLarge ? (
    <FeeBreakdownLarge fees={fees} totalFee={totalFee} />
  ) : (
    <FeeBreakdownMobile fees={fees} totalFee={totalFee} />
  );
};
