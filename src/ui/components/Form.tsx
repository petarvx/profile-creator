"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button, TextField } from "@mui/material";
import { useFieldArray, useForm } from "react-hook-form";
import { useBroadcastTransaction } from "../hooks/useBroadcastTransaction";
import { useBapContext } from "../context/BapContext";
import { usePublishFile } from "../hooks/usePublishFile";
import { usePandaWallet } from "panda-wallet-provider";
import { FEE_IN_DOLLARS, SATOSHIS_IN_BSV } from "../constants";
import { useState } from "react";
import { SelectAdditionalField } from "./SelectAdditionalField";
import { UpdateFeesAction } from "./PageForm";
import { buildIdentity } from "@/services/identity";

const fieldArrayName = "additionalFields";

export const ALL_ADDITIONAL_FIELDS: Field[] = [
  {
    name: "address",
    label: "Address",
    type: "text",
    fee: 0.01,
  },
  {
    name: "email",
    label: "Email",
    type: "text",
    fee: 0.01,
  },
];

const convertToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const downloadAsTextFile = (data: any) => {
  if (!data) return;

  const fileData = JSON.stringify(data);
  const blob = new Blob([fileData], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.download = "profile.json";
  link.href = url;
  link.click();
};

export type FormData = {
  name: string;
  image: FileList | null;
  location: string;
  description: string;
  address?: string;
  email?: string;
};

const schema = z.object({
  name: z.string().min(2),
  image: typeof window === "undefined" ? z.null() : z.instanceof(FileList),
  location: z.string(),
  description: z.string(),
  address: z.string().optional(),
  email: z.string().email("This is not a valid email.").optional(),
});

type FormSchemaType = z.infer<typeof schema>;

export type Field = {
  name: keyof FormData;
  type: "text" | "date" | "select";
  label: string;
  id?: string;
  fee: number;
};

type FormProps = {
  updateFees: (action: UpdateFeesAction, field: Field) => void;
  totalFee: number;
};

export const Form = ({ updateFees, totalFee }: FormProps) => {
  const { bapId, xprv, bap } = useBapContext();
  const { mutateAsync: broadcastTransaction } = useBroadcastTransaction();
  const { mutateAsync: publishFile } = usePublishFile();
  const { getBalance, getExchangeRate } = usePandaWallet();

  const [isAddingField, setIsAddingField] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormSchemaType>({
    resolver: zodResolver(schema),
  });

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: fieldArrayName,
  } as any);

  const values = watch();
  const availableFields = ALL_ADDITIONAL_FIELDS.filter(({ name }) => {
    return (
      !fields.find((f) => (f as any).name === name) &&
      (!Object.keys(values).includes(name) ||
        (Object.keys(values).includes(name) && values[name] === undefined))
    );
  });

  const onSubmit = async (data: FormData) => {
    const { name, location, description, ...additionalFields } = data;

    if (!image?.[0]) {
      // show missing image error
      return;
    }

    const file = await convertToBase64(image![0]);
    const base64 = file.split(",")[1];
    const b = {
      content: Buffer.from(base64, "base64") as any,
      contentType: image![0].type,
      encoding: "base64",
    };

    const { transactionId } = await publishFile(b);

    const identity = buildIdentity({
      name,
      imageTxId: transactionId,
      location,
      description,
      additionalFields,
    });

    const balance = await getBalance();
    const xr = await getExchangeRate();

    if (!balance || !xr || (balance && balance?.usdInCents < FEE_IN_DOLLARS)) {
      // show error
      return;
    }

    const feeInSatoshis = Math.ceil((totalFee / xr) * SATOSHIS_IN_BSV);

    if (bapId && identity) {
      try {
        await broadcastTransaction({
          bapId,
          data: identity,
          feeInSatoshis,
        });

        const ids = bap?.exportIds(true);
        const data = { xprv, ids };
        downloadAsTextFile(data);
      } catch (e) {
        // handle error
        console.log(e);
      }
    }
  };

  const image = watch("image");

  const handleRemoveField = (field: Field, idx: number) => {
    remove(idx);
    updateFees("remove", field);
    setValue(field.name, undefined);
  };

  const renderField = (field: Field, idx: number) => {
    switch (field?.type) {
      case "text":
      default:
        return (
          <Box className="w-full relative" key={field.name}>
            <TextField
              fullWidth
              label={field?.label}
              {...register(field.name)}
            />
            <Box
              className="absolute right-0 top-0 text-red-500 p-4 cursor-pointer"
              onClick={() => handleRemoveField(field, idx)}
            >
              X
            </Box>
          </Box>
        );
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="overflow-auto mb-28 md:mb-0"
    >
      <Box className="flex max-w-[350px] mx-auto flex-wrap gap-6 mt-12 md:mt-16">
        <TextField fullWidth label="Name" {...register("name")} />
        <Box className="flex w-full h-[56px]">
          <Box
            className="flex items-center w-full py-0 px-3 rounded-none"
            color="rgba(255, 255, 255, .7)"
            border="1px solid rgba(255,255,255, .23)"
          >
            {image?.[0]?.name ?? "Image"}
          </Box>
          <Button
            component="label"
            role={undefined}
            tabIndex={-1}
            color="secondary"
            className="min-w-fit text-sm rounded-none"
          >
            Select file
            <input
              type="file"
              style={{ display: "none" }}
              {...register("image")}
            />
          </Button>
        </Box>
        <TextField fullWidth label="Location" {...register("location")} />
        <TextField fullWidth label="Description" {...register("description")} />

        {fields.map((f, i: number) => renderField(f as unknown as Field, i))}

        {availableFields.length > 0 && isAddingField && (
          <SelectAdditionalField
            availableFields={availableFields}
            append={append as any}
            setIsAddingField={setIsAddingField}
            updateFees={updateFees}
          />
        )}

        <Button
          color="secondary"
          className="w-full"
          onClick={() => setIsAddingField(true)}
          disabled={isAddingField || !availableFields.length}
        >
          +
        </Button>
        <Box className="w-full flex justify-end">
          <Button type="submit" size="large">
            Submit
          </Button>
        </Box>
      </Box>
    </form>
  );
};
