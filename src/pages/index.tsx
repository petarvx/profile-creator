import { Typography } from "@mui/material";
import init from "bsv-wasm-web";
import { Inter } from "next/font/google";
import { useEffect, useState } from "react";
import FormPage from "../ui/components/PageForm";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [bsvWasmLoaded, setBsvWasmLoaded] = useState(false);

  useEffect(() => {
    init().then(() => {
      // Load with timeout to avoid
      // memory access out of bounds wasm error
      setTimeout(() => {
        setBsvWasmLoaded(true);
      }, 500);
    });
  }, []);

  return (
    <main
      className={`${inter.className} flex flex-col items-center overflow-hidden h-screen max-h-screen md:h-auto md:max-h-max md:overflow-auto p-6 sm:p-12 sm:p-18 lg:p-24`}
    >
      {bsvWasmLoaded && (
        <>
          <header className="text-center max-h-[100px] md:max-h-[200px]">
            <Typography className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl ">
              Create your identity
            </Typography>
          </header>
          <FormPage />
        </>
      )}
    </main>
  );
}
