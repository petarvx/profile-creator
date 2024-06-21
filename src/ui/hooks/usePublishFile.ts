import { useMutation } from "react-query";
import { buildBaseTx } from "../../services/blockchain";
import { SendBsvResponse, usePandaWallet } from "panda-wallet-provider";
import { usePanda } from "./usePanda";
import { useBapContext } from "../context/BapContext";
import { B_PREFIX } from "../constants";

export type BroadcastTransactionData = {
  content: string;
  contentType: string;
  encoding: string;
};

export interface BroadcastTransactionReturn {
  transactionId: string;
  rawTransaction: string;
}

export const usePublishFile = () => {
  const { sendBsv } = usePandaWallet();
  const { signTransaction } = useBapContext();
  const connectToPanda = usePanda();

  return useMutation<
    BroadcastTransactionReturn,
    unknown,
    BroadcastTransactionData
  >(
    async function (data) {
      try {
        await connectToPanda();

        const bData = [B_PREFIX, data.content, data.contentType, data.encoding];
        const signedPayload = signTransaction([...bData]);
        const { script } = buildBaseTx(signedPayload);

        // publish tx via panda wallet
        const { txid, rawtx } = (await sendBsv([
          {
            script: script.to_hex(),
            satoshis: 0,
          },
        ])) as SendBsvResponse;

        return { transactionId: txid, rawTransaction: rawtx };
      } catch (error) {
        console.log("usePublishFile", { error });
        return { transactionId: "", rawTransaction: "" };
      }
    },
    {
      onSuccess() {
        console.log("file tx broadcast called");
        // notifyIndexer(Buffer.from(rawTransaction, "base64").toString("hex"));
      },
      onError(error) {
        console.error(error);
      },
    }
  );
};
