import { Script, Transaction, TxOut } from "bsv-wasm-web";

export const buildBaseTx = (txHexArray: string[]) => {
  const script = Script.from_asm_string(
    `OP_0 OP_RETURN ${txHexArray.join(" ")}`
  );

  const transaction = new Transaction(1, 0);
  const txOut = new TxOut(BigInt(0), script);
  transaction.add_output(txOut);
  const txHex = transaction.to_hex();

  return { script, txHex };
};

export function buildTransaction(
  data: string,
  txHexArray: string[]
): {
  txHex: string;
  script: Script;
} {
  /**
   * if tx already starts with OP_RETURN,
   * remove it from the array since
   * it will be added later
   */
  if (txHexArray[0] === "6a") {
    txHexArray.shift();
  }

  return buildBaseTx(txHexArray);
}

export function isHex(h: string | Buffer) {
  if (typeof h === "string") {
    const a = parseInt(h, 16);
    return a.toString(16).toLowerCase() === h.toLowerCase();
  }

  return false;
}

export const toHex = (s: string) => {
  let hex = "";

  for (var i = 0, l = s.length; i < l; i++) {
    hex += s.charCodeAt(i).toString(16);
  }

  return hex;
};
