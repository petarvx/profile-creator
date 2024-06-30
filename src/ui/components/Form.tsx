"use client";

import { useEffect } from "react";
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

type ImageTransaction = {
  transactionId: string;
  rawTransaction: string;
};
type PublishedImages = {
  image: ImageTransaction | null;
  logo: ImageTransaction | null;
  banner: ImageTransaction | null;
};

export const ALL_ADDITIONAL_FIELDS: Field[] = [
  { name: "image", label: "Image", type: "image", fee: 0 },
  {
    name: "location",
    label: "Location",
    type: "text",
    fee: 0,
  },
  {
    name: "description",
    label: "Description",
    type: "text",
    fee: 0,
  },
  {
    name: "address",
    label: "Address",
    type: "text",
    fee: 0,
  },
  {
    name: "email",
    label: "Email",
    type: "text",
    fee: 0,
  },
  {
    name: "paymail",
    label: "Paymail",
    type: "text",
    fee: 0,
  },
  {
    name: "bitcoinAddress",
    label: "Bitcoin Address",
    type: "text",
    fee: 0,
  },
  { name: "url", label: "Url", type: "text", fee: 0 },
  { name: "logo", label: "Logo", type: "image", fee: 0 },
  { name: "banner", label: "Banner", type: "image", fee: 0 },
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
  name?: string;
  image?: FileList | null;
  banner?: FileList | null;
  logo?: FileList | null;
  location?: string;
  description?: string;
  address?: string;
  email?: string;
  paymail?: string;
  bitcoinAddress?: string;
  url?: string;
};

const schema = z.object({
  name: z.string().optional(),
  image:
    typeof window === "undefined"
      ? z.null()
      : z.instanceof(FileList).optional(),
  logo:
    typeof window === "undefined"
      ? z.null()
      : z.instanceof(FileList).optional(),
  banner:
    typeof window === "undefined"
      ? z.null()
      : z.instanceof(FileList).optional(),
  location: z.string().optional(),
  description: z.string().optional(),
  address: z.string().optional(),
  email: z.string().email("This is not a valid email.").optional(),
  paymail: z.string().email("This is not a valid email.").optional(),
  bitcoinAddress: z.string().optional(),
  url: z.string().url("This is not a valid url.").optional(),
});

type FormSchemaType = z.infer<typeof schema>;

export type Field = {
  name: keyof FormData;
  type: "text" | "date" | "select" | "image";
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

  const processFile = async (imgFile: FileList) => {
    const file = await convertToBase64(imgFile![0]);
    const base64 = file.split(",")[1];
    return {
      content: Buffer.from(base64, "base64") as any,
      contentType: imgFile![0].type,
      encoding: "base64",
    };
  };

  const handleImageFiles = async (
    image: FileList | null | undefined,
    logo: FileList | null | undefined,
    banner: FileList | null | undefined
  ) => {
    const imageBuffer = image?.[0] && (await processFile(image));
    const logoBuffer = logo?.[0] && (await processFile(logo));
    const bannerBuffer = banner?.[0] && (await processFile(banner));
    const publishedImages: PublishedImages = {
      image: null,
      logo: null,
      banner: null,
    };

    if (imageBuffer) {
      publishedImages.image = await publishFile(imageBuffer);
    }

    if (logoBuffer) {
      publishedImages.logo = await publishFile(logoBuffer);
    }

    if (bannerBuffer) {
      publishedImages.banner = await publishFile(bannerBuffer);
    }

    return publishedImages;
  };

  const onSubmit = async (data: FormData) => {
    console.log(data);

    const {
      name,
      image,
      logo,
      banner,
      location,
      description,
      email,
      url,
      address,
    } = data;

    const publishedImages = await handleImageFiles(image, logo, banner);

    const identity = buildIdentity({
      name,
      imageTxId: publishedImages?.image?.transactionId,
      logoTxId: publishedImages?.logo?.transactionId,
      bannerTxId: publishedImages?.banner?.transactionId,
      location,
      description,
      email,
      url,
      address,
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
  const banner = watch("banner");
  const logo = watch("logo");

  const handleRemoveField = (field: Field, idx: number) => {
    remove(idx);
    updateFees("remove", field);
    setValue(field.name, undefined);
  };

  const renderField = (field: Field, idx: number) => {
    switch (field?.type) {
      case "image":
        const isBanner = field.name === "banner";
        const fieldTextBanner = banner?.[0]
          ? banner?.[0]?.name
          : "Banner Image";
        const fieldTextLogo = logo?.[0] ? logo?.[0]?.name : "Logo Image";
        return (
          <Box className="flex w-full h-[56px] relative" key={field.name}>
            <Box
              className="flex w-full items-center py-0 px-3 rounded-none text-ellipsis overflow-hidden "
              color="rgba(255, 255, 255, .7)"
              border="1px solid rgba(255,255,255, .23)"
            >
              {isBanner ? fieldTextBanner : fieldTextLogo}
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
                {...register(field.name)}
              />
            </Button>
            <Box
              className="absolute right-0 top-0 text-red-500 p-4 cursor-pointer"
              style={{ right: "-45px" }}
              //onClick={() => handleRemoveField(field, idx)}
            >
              X
            </Box>
          </Box>
        );

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
              className="absolute top-0 text-red-500 p-4 cursor-pointer"
              onClick={() => handleRemoveField(field, idx)}
              style={{ right: "-45px" }}
            >
              X
            </Box>
            {errors[field.name] && <p>{errors[field.name]?.message}</p>}
          </Box>
        );
    }
  };

  const addDefaultFields = () => {
    if (!fields.length) {
      const field: Field = ALL_ADDITIONAL_FIELDS.find(
        (f) => f.name === "location"
      )!;
      const field2: Field = ALL_ADDITIONAL_FIELDS.find(
        (f) => f.name === "email"
      )!;
      append(field);
      append(field2);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      addDefaultFields();
    }, 500);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mb-28 md:mb-0 pr-10">
      <Box className="flex max-w-[350px] mx-auto flex-wrap gap-6 mt-12 md:mt-16">
        <Box className="w-full relative">
          <TextField fullWidth label="Name" {...register("name")} />
        </Box>

        {/* <Box className="flex w-full relative h-[56px]">
          <Box
            className="flex w-full items-center py-0 px-3 rounded-none text-ellipsis overflow-hidden "
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
          <Box
            className="absolute right-0 top-0 text-red-500 p-4 cursor-pointer"
            style={{ marginRight: "-45px" }}
          >
            X
          </Box>
        </Box> */}
        {/* <TextField fullWidth label="Location" {...register("location")} />
        <TextField fullWidth label="Description" {...register("description")} /> */}

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
