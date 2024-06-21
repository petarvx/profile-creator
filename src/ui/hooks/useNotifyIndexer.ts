export const useNotifyIndexer = () => (rawTx: string) =>
  new Promise((resolve, reject) => {
    fetch("https://bmap-api-production.up.railway.app/ingest", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ rawTx }),
    })
      .then((resp) => {
        console.log({ resp });
        const json = resp.json();
        resolve(json);
      })
      .catch((e) => {
        reject(e);
      });
  });
