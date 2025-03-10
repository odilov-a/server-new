const fs = require("fs/promises");
const path = require("path");
const axios = require("axios");
const { exec } = require("child_process");
const util = require("util");
const Problem = require("../models/Problem.js");
const Student = require("../models/Student.js");
const Attempt = require("../models/Attempt.js");

const execAsync = util.promisify(exec);
const stripAnsi = (str) => {
  if (typeof str !== "string") {
    return "";
  }
  return str.replace(/\x1b\[[0-9;]*m/g, "").trim();
};

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
  await fs.writeFile(filePath, code, { encoding: "utf8" });
  return new Promise((resolve) => {
    const child = exec(
      command,
      { timeout: timeLimit * 1000 },
      (error, stdout, stderr) => {
        const actualOutput = stripAnsi(stdout.toString()).trim();
        const expectedTrimmed = stripAnsi(expectedOutput).trim();
        const isCorrect = actualOutput === expectedTrimmed;
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
        console.log("Memory limit exceeded:", heapUsedMB, "MB");
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

const extractErrorMessage = (errorOutput) => {
  const lines = errorOutput.split("\n");
  const relevantLine = lines.find(
    (line) => line.includes("Error") || line.includes("Exception")
  );
  return relevantLine || "Error in compiler code";
};

exports.checkSolution = async (req, res) => {
  try {
    const { code, language } = req.body;
    if (!code || !language) {
      return res.status(400).json({
        status: "error",
        message: "Code and language are required",
      });
    }
    if (!req.student || !req.student.id) {
      return res.status(401).json({
        status: "error",
        message: "User not authenticated",
      });
    }
    const problem = await Problem.findById(req.params.id);
    if (!problem) {
      return res.status(404).json({
        status: "error",
        message: "Problem not found",
      });
    }
    const { timeLimit, memoryLimit, testCases, point } = problem;
    if (!testCases || testCases.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "Test cases not found for the problem",
      });
    }
    const existingAttempt = await Attempt.findOne({
      studentId: req.student.id,
      problemId: problem._id,
      isCorrect: true,
    });
    const isFirstAttemptCorrect = !existingAttempt;

    const timestamp = Date.now();
    let fileName, command;
    const testDir = path.join(__dirname, "../tests");
    switch (language.toLowerCase()) {
      case "python3":
        fileName = `${timestamp}.py`;
        command = `python3 ${path.join(testDir, fileName)}`;
        break;
      case "java":
        fileName = `Solution.java`;
        const updatedJavaCode = code.replace(
          /public\s+class\s+\w+/g,
          "public class Solution"
        );
        await fs.writeFile(path.join(testDir, fileName), updatedJavaCode, {
          encoding: "utf8",
        });
        command = `javac ${path.join(
          testDir,
          fileName
        )} && java -cp ${testDir} Solution`;
        break;
      case "javascript":
        fileName = `${timestamp}.js`;
        command = `node ${path.join(testDir, fileName)}`;
        break;
      case "cpp":
      case "c++":
        fileName = `${timestamp}.cpp`;
        const outputFileName = `${timestamp}.exe`;
        command = `g++ ${path.join(testDir, fileName)} -o ${path.join(
          testDir,
          outputFileName
        )} && ${path.join(testDir, outputFileName)}`;
        break;
      default:
        return res.status(400).json({
          status: "error",
          message: "Invalid language",
        });
    }

    let allCorrect = true;
    let failedTestCaseIndex = null;
    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      const input = await axios
        .get(testCase.inputFileUrl, { responseType: "text" })
        .then((res) => res.data);
      const expectedOutput = await axios
        .get(testCase.outputFileUrl, { responseType: "text" })
        .then((res) => res.data);
      const result = await executeCode(
        fileName,
        command,
        input,
        expectedOutput,
        code,
        timeLimit,
        memoryLimit
      );
      if (!result.isCorrect) {
        allCorrect = false;
        failedTestCaseIndex = i + 1;
        break;
      }
    }

    const attempt = new Attempt({
      studentId: req.student.id,
      problemId: problem._id,
      code,
      language,
      isCorrect: allCorrect,
      failedTestCaseIndex,
      timeLimit,
      memoryLimit,
    });
    await attempt.save();

    const student = await Student.findById(req.student.id);
    if (!student) {
      return res.status(404).json({
        status: "error",
        message: "Student not found",
      });
    }

    if (student.balance === null) {
      student.balance = 0;
    }
    if (allCorrect && isFirstAttemptCorrect) {
      student.balance += point;
    }
    student.history.push(problem._id);
    await student.save();
    await fs.unlink(path.join(testDir, fileName));
    return res.json({
      data: {
        correct: allCorrect,
        balance: student.balance,
        history: student.history,
      },
    });
  } catch (error) {
    const errorMessage = extractErrorMessage(error.message);
    return res.status(500).json({
      status: "error",
      message: errorMessage,
    });
  }
};

exports.testRunCode = async (req, res) => {
  try {
    const { code, language } = req.body;
    if (!code || !language) {
      return res.status(400).json({
        status: "error",
        message: "Code and language are required",
      });
    }
    const timestamp = Date.now();
    let fileName, command, className;
    const testDir = path.join(__dirname, "../tests");
    switch (language.toLowerCase()) {
      case "python3":
        fileName = `${timestamp}.py`;
        command = `python3 ${path.join(testDir, fileName)}`;
        break;
      case "java":
        fileName = `${timestamp}.java`;
        className = code.match(/class\s+(\w+)/)[1];
        command = `javac ${path.join(
          testDir,
          fileName
        )} && java -cp ${testDir} ${className}`;
        break;
      case "javascript":
        fileName = `${timestamp}.js`;
        command = `node ${path.join(testDir, fileName)}`;
        break;
      case "cpp":
      case "c++":
        fileName = `${timestamp}.cpp`;
        const outputFileName = `${timestamp}.exe`;
        command = `g++ ${path.join(testDir, fileName)} -o ${path.join(
          testDir,
          outputFileName
        )} && ${path.join(testDir, outputFileName)}`;
        break;
      default:
        return res.status(400).json({
          status: "error",
          message: "Invalid language",
        });
    }
    const filePath = path.join(testDir, fileName);
    await fs.writeFile(filePath, code, { encoding: "utf8" });
    const result = await new Promise((resolve) => {
      exec(command, { timeout: 5000 }, (error, stdout, stderr) => {
        if (error) {
          const errorMessage = extractErrorMessage(stripAnsi(stderr));
          resolve({
            output: errorMessage,
            error: "Execution failed",
          });
        } else {
          resolve({
            output: stripAnsi(stdout),
            error: null,
          });
        }
      });
    });
    await fs.unlink(filePath);
    return res.json({ data: result });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

exports.getSolution = async (req, res) => {
  try {
    if (!req.student || !req.student.id) {
      return res.status(401).json({
        status: "error",
        message: "User not authenticated",
      });
    }
    const attempts = await Attempt.find({ studentId: req.student.id });
    return res.json({ data: attempts });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
