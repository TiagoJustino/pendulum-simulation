// Used for debug purposes

const flushStderr = async () => {
  return new Promise((resolve) => {
    if (process.stderr.writableLength) {
      process.stderr.write("", () => {
        resolve(true);
      });
    } else {
      resolve(true);
    }
  });
};

export const consoleErrorWithFlush = async (message: string) => {
  process.stderr.write(`${message}\n`);
  await flushStderr();
};
