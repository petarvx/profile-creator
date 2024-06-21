type RequiredFields = {
  name: string;
  imageTxId: string;
  location: string;
  description: string;
};

type AdditionalFields = Partial<{
  additionalFields: {
    address?: string;
    email?: string;
  };
}>;

type AllFields = RequiredFields & AdditionalFields;

export const buildIdentity = ({
  name,
  location,
  description,
  imageTxId,
  additionalFields,
}: AllFields): string => {
  const address = additionalFields?.address
    ? { address: additionalFields?.address }
    : {};
  const email = additionalFields?.email
    ? { email: additionalFields?.email }
    : {};

  const identity = {
    "@context": "https://schema.org",
    "@type": "Person",
    alternateName: name,
    image: `b://${imageTxId}`,
    homeLocation: {
      "@type": "Place",
      name: location,
    },
    description,
    ...address,
    ...email,
  };

  return JSON.stringify(identity);
};
