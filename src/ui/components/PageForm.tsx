import { Box } from "@mui/material";
import { useMemo, useState } from "react";
import { FormStepOne } from "./FormStepOne";
import { BapContextProvider } from "../context/BapContext";
import { Field, Form } from "./Form";
import { FeeBreakdown } from "./FeeBreakdown";
import { FEE_IN_DOLLARS, STORAGE_MNEMONIC_KEY } from "../constants";

enum Step {
  Type,
  Form,
}

enum SeedPhrase {
  New = "new",
  Mnemonic = "mnemonic",
  Yours = "yours",
}

type TypeFormData = {
  seedPhrase: SeedPhrase;
  mnemonic?: string;
};

export type UpdateFeesAction = "add" | "remove";
export type Fee = { label: string; fee: number };
export type Fees = Fee[];

const BASE_FEE: Fee = { label: "Base", fee: FEE_IN_DOLLARS };

const FormPage = () => {
  const [step, setStep] = useState<Step>(Step.Type);
  const [fees, setFees] = useState<Fees>([BASE_FEE]);

  const saveMnemonic = ({ mnemonic, seedPhrase }: TypeFormData) => {
    const isValidMnemonic =
      seedPhrase === SeedPhrase.Mnemonic
        ? mnemonic?.split(" ").length === 12
        : true;

    if (isValidMnemonic) {
      sessionStorage.setItem(STORAGE_MNEMONIC_KEY, mnemonic!);
      setStep(Step.Form);
    }
  };

  const updateFees = (action: UpdateFeesAction, field: Field) => {
    if (field.fee) {
      setFees((fees) =>
        action === "remove"
          ? fees.filter((fee) => fee.label !== field.label)
          : [...fees, { label: field.label, fee: field.fee }]
      );
    }
  };

  const totalFee = useMemo(
    () => fees.reduce((acc: number, { fee }: Fee) => (acc += fee), 0),
    [fees]
  );

  return (
    <>
      {step === Step.Type && <FormStepOne onSubmit={saveMnemonic} />}

      {step === Step.Form && (
        <BapContextProvider>
          <Box className="flex justify-center gap-16 w-full max-w-[960px] h-full sm:flex sm:gap-8">
            <Form updateFees={updateFees} totalFee={totalFee} />
            <FeeBreakdown fees={fees} totalFee={totalFee} />
          </Box>
        </BapContextProvider>
      )}
    </>
  );
};

export default FormPage;
