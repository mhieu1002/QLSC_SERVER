import bodyParser from "body-parser";
import cors from "cors";
import * as dotenv from "dotenv";
import express from "express";
import http from "http";
import passport from "passport";
import { httpRequestLogger } from "./middlewares/logger";
import { errorHandler } from "./middlewares/request-handlers";
import { rootRouter } from "./routers";
dotenv.config();

const { port } = process.env;

const app = express();

app.use(passport.initialize());

app.use(bodyParser.json({ limit: "50mb", type: "application/json" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(httpRequestLogger());

app.use("/api", rootRouter);

app.use(errorHandler);

http.createServer(app).listen(port, () => {
  const a = new Date("2024-02-22 06:53:56.276")
  console.log("🚀 ~ http.createServer ~ a:")
  // eslint-disable-next-line no-console
  console.log(`Server listening on port ${port}`);
});
