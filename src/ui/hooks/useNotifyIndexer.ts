import { toast } from "react-toastify";

export const useNotifyIndexer = () => (rawTx: string) =>
  new Promise((resolve, reject) => {
    fetch(`https://ordinals.gorillapool.io/api/tx/${rawTx}/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((resp) => {
        if (resp.ok) {
          toast.success("Profile created successfully!");
        }
      })
      .catch((e) => {
        toast.error("Something went wrong. Please try again");
        console.log(e);
      });
  });
