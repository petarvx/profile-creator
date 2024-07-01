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
  email?: string;
  paymail?: string;
  address?: string;
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
}: AllFields): string => {
  const identity: Data = {
    "@context": "https://schema.org",
    "@type": "Person",
    alternateName: name,
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
    identity["email"] = email;
  }

  if (paymail) {
    identity["paymail"] = paymail;
  }

  if (address) {
    identity["address"] = address;
  }

  if (bitcoinAddress) {
    identity["bitcoinAddress"] = bitcoinAddress;
  }

  return JSON.stringify(identity);
};
