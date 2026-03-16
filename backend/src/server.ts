import "dotenv/config";
import { createApp } from "./createApp.js";

const PORT = process.env.PORT || 3000;

const server = createApp().listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

// Optional: Handle unhandled rejections globally
process.on("unhandledRejection", (err: Error) => {
  console.error("UNHANDLED REJECTION! 💥 Shutting down...");
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
