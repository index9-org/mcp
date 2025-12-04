import pino from "pino";

const logger = pino({ name: "index9", level: "info" }, process.stderr);

export { logger };
