const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { exec } = require("child_process");
const Problem = require("../models/Problem.js");
const Student = require("../models/Student.js");
const Attempt = require("../models/Attempt.js");

const stripAnsi = (str) => str.replace(/\x1b\[[0-9;]*m/g, "").trim();

const executeCode = async (
  // fileName,
  command,
  input,
  expectedOutput,
  timeLimit,
  memoryLimit
) => {
  // const filePath = path.join(__dirname, "../tests", fileName);
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

const downloadFile = async (url, filepath) => {
  try {
    const response = await axios.get(url, { responseType: "arraybuffer" });
    fs.writeFileSync(filepath, Buffer.from(response.data));
  } catch (error) {
    throw new Error("Invalid URL");
  }
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

    if (existingAttempt) {
      return res.status(400).json({
        status: "error",
        message: "You have already successfully solved this problem.",
      });
    }

    const timestamp = Date.now();
    let fileName, command;

    switch (language.toLowerCase()) {
      case "python":
        fileName = `${timestamp}.py`;
        command = `python ${path.join(__dirname, "../tests", fileName)}`;
        break;
      case "java":
        fileName = `Solution.java`;
        const updatedJavaCode = code.replace(
          /public\s+class\s+\w+/g,
          "public class Solution"
        );
        fs.writeFileSync(
          path.join(__dirname, "../tests", fileName),
          updatedJavaCode,
          { encoding: "utf8" }
        );
        command = `javac ${path.join(
          __dirname,
          "../tests",
          fileName
        )} && java -cp ${path.join(__dirname, "../tests")} Solution`;
        break;
      case "javascript":
        fileName = `${timestamp}.js`;
        command = `node ${path.join(__dirname, "../tests", fileName)}`;
        break;
      case "cpp":
      case "c++":
        fileName = `${timestamp}.cpp`;
        const outputFileName = `${timestamp}.exe`;
        command = `g++ ${path.join(
          __dirname,
          "../tests",
          fileName
        )} -o ${path.join(
          __dirname,
          "../tests",
          outputFileName
        )} && ${path.join(__dirname, "../tests", outputFileName)}`;
        break;
      default:
        return res.status(400).json({
          status: "error",
          message: "Invalid language",
        });
    }

    let allCorrect = true;
    let failedTestCaseIndex = null;

    try {
      for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];
        const inputFilePath = path.join(
          __dirname,
          "../tests",
          `input_${timestamp}.txt`
        );
        const outputFilePath = path.join(
          __dirname,
          "../tests",
          `output_${timestamp}.txt`
        );

        await downloadFile(testCase.inputFileUrl, inputFilePath);
        await downloadFile(testCase.outputFileUrl, outputFilePath);

        const input = fs.readFileSync(inputFilePath, "utf-8");
        const expectedOutput = fs.readFileSync(outputFilePath, "utf-8");

        const result = await executeCode(
          fileName,
          command,
          input,
          expectedOutput,
          timeLimit,
          memoryLimit
        );
        if (!result.isCorrect) {
          allCorrect = false;
          failedTestCaseIndex = i + 1;
          break;
        }

        fs.unlinkSync(inputFilePath);
        fs.unlinkSync(outputFilePath);
      }
    } finally {
      if (fs.existsSync(path.join(__dirname, "../tests", fileName))) {
        fs.unlinkSync(path.join(__dirname, "../tests", fileName));
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
    if (allCorrect) {
      student.balance += point;
    }
    student.history.push(problem._id);
    await student.save();

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
    switch (language.toLowerCase()) {
      case "python":
        fileName = `${timestamp}.py`;
        command = `python ${path.join(__dirname, "../tests", fileName)}`;
        break;
      case "java":
        fileName = `${timestamp}.java`;
        className = code.match(/class\s+(\w+)/)[1];
        command = `javac ${path.join(
          __dirname,
          "../tests",
          fileName
        )} && java -cp ${path.join(__dirname, "../tests")} ${className}`;
        break;
      case "javascript":
        fileName = `${timestamp}.js`;
        command = `node ${path.join(__dirname, "../tests", fileName)}`;
        break;
      case "cpp":
      case "c++":
        fileName = `${timestamp}.cpp`;
        const outputFileName = `${timestamp}.exe`;
        command = `g++ ${path.join(
          __dirname,
          "../tests",
          fileName
        )} -o ${path.join(
          __dirname,
          "../tests",
          outputFileName
        )} && ${path.join(__dirname, "../tests", outputFileName)}`;
        break;
      default:
        return res.status(400).json({
          status: "error",
          message: "Invalid language",
        });
    }
    const filePath = path.join(__dirname, "../tests", fileName);
    fs.writeFileSync(filePath, code, { encoding: "utf8" });
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
    fs.unlinkSync(filePath);
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
