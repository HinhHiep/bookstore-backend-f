import express from "express";
import cors from "cors";
import morgan from "morgan";
import routes from "./routes/index.js";
import { errorHandler } from "./common/middlewares/error.middleware.js";
import chatbotRoutes from "./modules/chatbot/chatbot.route.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// 🔥 API
app.use("/api", routes);
app.use("/api/chatbot", chatbotRoutes);

// 🔥 error handler (luôn để cuối)
app.use(errorHandler);

export default app;