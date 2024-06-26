import { usePandaWallet } from "panda-wallet-provider";
import { useState } from "react";

export const usePanda = () => {
  const { connect, isReady } = usePandaWallet();
  const [pubKey, setPubKey] = useState<string | undefined>();

  return async () => {
    if (!isReady) {
      window.open(
        "https://chromewebstore.google.com/detail/panda-wallet/mlbnicldlpdimbjdcncnklfempedeipj",
        "_blank"
      );
      return;
    }

    if (!pubKey) {
      const identityPubKey = await connect();

      if (identityPubKey) {
        setPubKey(identityPubKey);
      }
    }
  };
};
