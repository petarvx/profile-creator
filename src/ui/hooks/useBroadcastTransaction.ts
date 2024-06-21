import { useMutation } from "react-query";
import { buildTransaction } from "../../services/blockchain";
import { SendBsvResponse, usePandaWallet } from "panda-wallet-provider";
import { BAP_ID } from "bitcoin-bap";
import { BAP_PREFIX, FEE_ADDRESS } from "../constants";
import { useBapContext } from "../context/BapContext";
import { useNotifyIndexer } from "./useNotifyIndexer";

export type BroadcastTransactionData = {
  bapId: BAP_ID;
  data: string;
  feeInSatoshis: number;
};

export interface BroadcastTransactionReturn {
  transactionId: string;
  rawTransaction: string;
}

export const useBroadcastTransaction = () => {
  const { sendBsv } = usePandaWallet();
  const { signTransaction } = useBapContext();
  const notifyIndexer = useNotifyIndexer();

  return useMutation<
    BroadcastTransactionReturn,
    unknown,
    BroadcastTransactionData
  >(
    async function ({ bapId, data, feeInSatoshis }) {
      const bapData = [BAP_PREFIX, "ID", bapId.getIdentityKey(), data];

      const signedTx = signTransaction(bapData);
      const { script } = buildTransaction(data, signedTx);

      const { txid, rawtx } = (await sendBsv([
        {
          script: script.to_hex(),
          satoshis: 0,
        },
        {
          address: FEE_ADDRESS,
          satoshis: feeInSatoshis,
        },
      ])) as SendBsvResponse;

      return { transactionId: txid, rawTransaction: rawtx };
    },
    {
      onSuccess({ rawTransaction }) {
        notifyIndexer(rawTransaction);
      },
      onError(error) {
        console.error(error);
      },
    }
  );
};
