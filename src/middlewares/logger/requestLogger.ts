import morgan from "morgan";

const httpRequestLogger = () =>
  morgan(":method :url :status response-time: :response-time ms", {
    stream: {
      // eslint-disable-next-line no-console
      write: (message) =>
        console.log(`${new Date().toISOString()}:: ${message.trim()}`),
    },
  });

export { httpRequestLogger };
