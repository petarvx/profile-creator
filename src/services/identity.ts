// type RequiredFields = {
//   name: string;
//   imageTxId: string;
//   location: string;
//   description: string;
// };

// type AdditionalFields = Partial<{
//   additionalFields: {
//     address?: string;
//     email?: string;
//   };
// }>;

// type AllFields = RequiredFields & AdditionalFields;

interface Place {
  name?: string;
  "@type": "Place";
}

interface Data {
  "@context"?: string;
  "@type"?: string;
  alternateName?: string;
  description?: string;
  homeLocation?: Place;
  url?: string;
  banner?: string;
  logo?: string;
  image?: string;
  paymail?: string;
  bitcoinAddress?: string;
}

type AllFields = {
  name?: string;
  imageTxId?: string;
  location?: string;
  description?: string;
  url?: string;
  bannerTxId?: string;
  logoTxId?: string;
  email?: string;
  address?: string;
  paymail?: string;
  bitcoinAddress?: string;
};

export const buildIdentity = ({
  name,
  imageTxId,
  logoTxId,
  bannerTxId,
  location,
  description,
  url,
  email,
  address,
  paymail,
  bitcoinAddress,
}: //additionalFields,
AllFields): string => {
  // const address = additionalFields?.address
  //   ? { address: additionalFields?.address }
  //   : {};
  // const email = additionalFields?.email
  //   ? { email: additionalFields?.email }
  //   : {};

  const identity: Data = {
    "@context": "https://schema.org",
    "@type": "Person",
    alternateName: name,
    //image: `b://${imageTxId}`,
    // homeLocation: {
    //   "@type": "Place",
    //   name: location,
    // },
    //  description,
    //...address,
    //...email,
  };

  if (imageTxId) {
    identity["image"] = `b://${imageTxId}`;
  }

  if (description) {
    identity["description"] = description;
  }

  if (location) {
    identity["homeLocation"] = {
      "@type": "Place",
      name: location,
    };
  }

  if (url) {
    identity["url"] = url;
  }

  if (logoTxId) {
    identity["logo"] = `b://${logoTxId}`;
  }

  if (bannerTxId) {
    identity["banner"] = `b://${bannerTxId}`;
  }

  if (email) {
    identity["paymail"] = email;
  }

  if (address) {
    identity["bitcoinAddress"] = address;
  }

  return JSON.stringify(identity);
};
