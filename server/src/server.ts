import express, { Application } from "express";
import { config } from "@/__boot/config";
// import { limiter } from "@/__lib/http/rateLimit";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import mongoSanitize from "express-mongo-sanitize";
import morgan from "morgan";
import {startCronJobs} from "./__lib/utils/cron";
import { notFound, errorHandler } from "@/middlewares";
import {
  authRoutes,
  workflowRoutes,
  templateRoutes,
  fieldRoutes,
  onboardingRoutes,
} from "./routes";

dotenv.config();

const app: Application = express();

//security middlewares
app.use(helmet());
app.use(mongoSanitize());

//Rate limiting
// app.use(limiter);

// CORS setup
const corsOptions = {
  credentials: true,
  origin: [config.client.clienturl],
  methods: "GET, HEAD, PUT, PATCH, POST, DELETE",
};
app.use(cors(corsOptions));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//logger middleware
app.use(morgan("dev"));

//Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/workflows", workflowRoutes);
app.use("/api/v1/templates", templateRoutes);
app.use("/api/v1/fields", fieldRoutes);
app.use("/api/v1/onboarding",onboardingRoutes);

//error handling middlewares
app.use(notFound);
app.use(errorHandler);

startCronJobs();

export default app;
