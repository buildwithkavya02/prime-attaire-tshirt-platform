import "dotenv/config";
import { connectDB } from "./src/config/db.js";
import { createApp } from "./src/app.js";

async function main() {
  await connectDB();
  const app = createApp();
  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    console.log(`[server] Prime Attaire backend listening on port ${port}`);
  });
}

main().catch((err) => {
  console.error("[server] failed to start:", err);
  process.exit(1);
});
