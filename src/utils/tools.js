const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { exec } = require("child_process");

const stripAnsi = (str) => str.replace(/\x1b\[[0-9;]*m/g, "").trim();

/**
 * Kodni bajarish funksiyasi
 * @param {string} fileName Fayl nomi
 * @param {string} command Ishlatiladigan buyruq (masalan, `node`, `python`, va h.k.)
 * @param {string} input Kiritma (stdin)
 * @param {string} expectedOutput Kutilayotgan chiqish
 * @param {string} code Bajariladigan kod
 * @param {number} timeLimit Vaqt cheklovi (soniyada)
 * @param {number} memoryLimit Xotira cheklovi (MBda)
 * @returns {Promise<{actualOutput: string, isCorrect: boolean, error: string}>}
 */
const executeCode = async (
  fileName,
  command,
  input,
  expectedOutput,
  code,
  timeLimit,
  memoryLimit
) => {
  const filePath = path.join(__dirname, "../tests", fileName);
  fs.writeFileSync(filePath, code, { encoding: "utf8" });
  return new Promise((resolve) => {
    const child = exec(
      command,
      { timeout: timeLimit * 1000 },
      (error, stdout, stderr) => {
        const actualOutput = stripAnsi(stdout.toString());
        const isCorrect = actualOutput.trim() === expectedOutput.trim();
        resolve({
          actualOutput,
          isCorrect,
          error: error ? stripAnsi(stderr.toString()) : null,
        });
      }
    );

    if (input) {
      child.stdin.write(input);
      child.stdin.end();
    }

    const memoryCheckInterval = setInterval(() => {
      const usage = process.memoryUsage();
      const heapUsedMB = usage.heapUsed / 1024 / 1024;
      if (heapUsedMB > memoryLimit) {
        clearInterval(memoryCheckInterval);
        child.kill("SIGKILL");
        resolve({
          actualOutput: null,
          isCorrect: false,
          error: "Memory limit exceeded",
        });
      }
    }, 100);

    child.on("exit", () => clearInterval(memoryCheckInterval));
  });
};

/**
 * URL orqali faylni yuklab olish
 * @param {string} url Fayl URL manzili
 * @param {string} filepath Faylni saqlash uchun yo'l
 * @returns {Promise<void>}
 */
const downloadFile = async (url, filepath) => {
  try {
    const response = await axios.get(url, { responseType: "arraybuffer" });
    fs.writeFileSync(filepath, Buffer.from(response.data));
  } catch (error) {
    throw new Error("Invalid URL");
  }
};

/**
 * Xatolik xabarlarini chiqarib olish
 * @param {string} errorOutput Xatolik chiqishi
 * @returns {string} Eng muhim xatolik xabari
 */
const extractErrorMessage = (errorOutput) => {
  const lines = errorOutput.split("\n");
  const relevantLine = lines.find(
    (line) => line.includes("Error") || line.includes("Exception")
  );
  return relevantLine || "Error in compiler code";
};

module.exports = { executeCode, downloadFile, extractErrorMessage };
