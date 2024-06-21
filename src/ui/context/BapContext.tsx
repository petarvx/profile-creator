import { BAP, BAP_ID } from "bitcoin-bap";
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { generateMnemonic } from "bip39";
import { ExtendedPrivateKey } from "bsv-wasm-web";
import { isHex } from "../../services/blockchain";
import { STORAGE_MNEMONIC_KEY } from "../constants";

interface IBapContext {
  bap?: BAP;
  bapId?: BAP_ID;
  signTransaction: (tx: string[]) => string[];
  xprv: string;
}

const BapContext = createContext<IBapContext | undefined>(undefined);

export function BapContextProvider({ children }: PropsWithChildren) {
  const [bap, setBap] = useState<BAP>();
  const [bapId, setBapId] = useState<BAP_ID>();
  const [xprv, setXprv] = useState("");
  const [isPublishingBapIdentity, setIsPublishingBapIdentity] = useState(false);

  const createWallet = useCallback((providedMnemonic: string | null) => {
    const mnemonic = providedMnemonic ?? generateMnemonic();
    const wallet = ExtendedPrivateKey.from_mnemonic(
      Buffer.from(mnemonic, "utf8")
    );
    const epk = wallet.to_string();
    setXprv(epk);

    return { wallet, epk };
  }, []);

  const load = useCallback(() => {
    setIsPublishingBapIdentity(true);
    const existingMnemonic = sessionStorage.getItem(STORAGE_MNEMONIC_KEY);
    const { wallet, epk } = createWallet(existingMnemonic);

    if (!wallet || !epk || bap || isPublishingBapIdentity) {
      setIsPublishingBapIdentity(false);
      return;
    }

    const newBap = new BAP(epk);
    setBap(newBap);

    const newBapId = newBap.newId();
    setBapId(newBapId);

    setIsPublishingBapIdentity(false);
  }, [bap, createWallet, isPublishingBapIdentity]);

  const signTransaction = useCallback(
    (tx: string[]) => {
      let hexArray = tx;

      if (!isHex(tx[0])) {
        hexArray = tx.map((str) => Buffer.from(str, "utf8").toString("hex"));
      }

      return bapId!.signOpReturnWithAIP(hexArray);
    },
    [bapId]
  );

  useEffect(() => {
    if (isPublishingBapIdentity || bap || bapId) {
      return;
    }
    load();
  }, [bap, bapId, isPublishingBapIdentity, load]);

  const value = useMemo(() => {
    return {
      bap,
      bapId,
      xprv,
      signTransaction,
    };
  }, [bap, bapId, signTransaction, xprv]);

  return <BapContext.Provider value={value}>{children}</BapContext.Provider>;
}

export function useBapContext() {
  const context = useContext(BapContext);

  if (!context) {
    throw Error("Call to useBapContext failed");
  }

  return context;
}

export default BapContext;
