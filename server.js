
const express = require("express");
const {
  createProxyMiddleware
} = require("http-proxy-middleware");

const app = express();
const PORT = process.env.PORT || 3000;

app.disable("x-powered-by");

// Domaine de démonstration autorisé.
// N'ajoute que des domaines que tu contrôles
// ou que tu as l'autorisation de relayer.
const ALLOWED_HOSTS = new Set([
  "example.com"
]);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use(express.static("public"));

app.use("/proxy/:host", (req, res, next) => {
  const host = String(req.params.host || "")
    .toLowerCase();

  if (!ALLOWED_HOSTS.has(host)) {
    return res.status(403).send(
      "Domaine non autorisé."
    );
  }

  const proxy = createProxyMiddleware({
    target: `https://${host}`,
    changeOrigin: true,
    secure: true,
    on: {
      error(err, req, res) {
        if (!res.headersSent) {
          res.status(502).send(
            "Erreur de connexion au site distant."
          );
        }
      }
    }
  });

  proxy(req, res, next);
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Nova Proxy lancé sur le port ${PORT}`);
});
