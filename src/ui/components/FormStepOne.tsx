import { Box, Button, Collapse, TextField, Typography } from "@mui/material";
import { FormCard } from "./FormCard";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

type Props = {
  onSubmit: (data: TypeFormData) => void;
};

enum SeedPhrase {
  New = "new",
  Mnemonic = "mnemonic",
  Yours = "yours",
}
const SeedPhraseSchema = z.nativeEnum(SeedPhrase);

type TypeFormData = {
  seedPhrase: SeedPhrase;
  mnemonic?: string;
};

const schema = z.object({
  seedPhrase: SeedPhraseSchema,
  mnemonic: z.string().optional(),
});

export const FormStepOne = ({ onSubmit }: Props) => {
  const { register, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      seedPhrase: SeedPhrase.New,
      mnemonic: "",
    },
    resolver: zodResolver(schema),
  });

  const seedPhrase = watch("seedPhrase");
  const mnemonic = watch("mnemonic");

  return (
    <Box component="section" className="w-full max-w-[400px] mt-12 md:mt-16">
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormCard
          isSelected={seedPhrase === SeedPhrase.New}
          onClick={() => setValue("seedPhrase", SeedPhrase.New)}
        >
          <Typography>Create new</Typography>
        </FormCard>
        <FormCard
          isSelected={seedPhrase === SeedPhrase.Mnemonic}
          onClick={() => setValue("seedPhrase", SeedPhrase.Mnemonic)}
        >
          <Typography>From Mnemonic</Typography>
          <Collapse
            in={seedPhrase === SeedPhrase.Mnemonic}
            timeout="auto"
            unmountOnExit
          >
            <TextField
              sx={{ marginTop: "1rem" }}
              fullWidth
              multiline
              label="Mnemonic"
              {...register("mnemonic")}
            />
          </Collapse>
        </FormCard>

        <FormCard
          isSelected={seedPhrase === SeedPhrase.Yours}
          onClick={() => setValue("seedPhrase", SeedPhrase.Yours)}
        >
          <Typography>Use Yours Wallet</Typography>
        </FormCard>

        <Box className="w-full flex justify-end">
          <Button size="large" type="submit">
            Next
          </Button>
        </Box>
      </form>
    </Box>
  );
};
