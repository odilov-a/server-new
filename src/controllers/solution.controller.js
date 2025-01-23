const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const Problem = require("../models/Problem.js");
const Student = require("../models/Student.js");
const Attempt = require("../models/Attempt.js");
const { executeCode, downloadFile, extractErrorMessage } = require("../utils/tools.js")

exports.checkSolution = async (req, res) => {
  try {
    const { code, language } = req.body;
    const studentId = req.student?.id;
    if (!code || !language) {
      return res.status(400).json({ status: "error", message: "Code and language are required" });
    }
    if (!studentId) {
      return res.status(401).json({ status: "error", message: "User not authenticated" });
    }
    const problem = await Problem.findById(req.params.id);
    if (!problem) {
      return res.status(404).json({ status: "error", message: "Problem not found" });
    }
    const { timeLimit, memoryLimit, testCases, point } = problem;
    if (!testCases || testCases.length === 0) {
      return res.status(400).json({ status: "error", message: "No test cases found for this problem" });
    }
    const isFirstAttemptCorrect = !(await Attempt.exists({ studentId, problemId: problem._id, isCorrect: true }));
    const timestamp = Date.now();
    let fileName, command;

    const filePath = path.join(__dirname, "../tests");
    const setupFileAndCommand = () => {
      switch (language.toLowerCase()) {
        case "python":
          fileName = `${timestamp}.py`;
          command = `python ${path.join(filePath, fileName)}`;
          break;
        case "java":
          fileName = "Solution.java";
          const updatedJavaCode = code.replace(/public\s+class\s+\w+/g, "public class Solution");
          fs.writeFileSync(path.join(filePath, fileName), updatedJavaCode, { encoding: "utf8" });
          command = `javac ${path.join(filePath, fileName)} && java -cp ${filePath} Solution`;
          break;
        case "javascript":
          fileName = `${timestamp}.js`;
          command = `node ${path.join(filePath, fileName)}`;
          break;
        case "cpp":
        case "c++":
          fileName = `${timestamp}.cpp`;
          const outputFileName = `${timestamp}.exe`;
          command = `g++ ${path.join(filePath, fileName)} -o ${path.join(filePath, outputFileName)} && ${path.join(filePath, outputFileName)}`;
          break;
        default:
          throw new Error("Unsupported programming language");
      }
    };
    setupFileAndCommand();
    let allCorrect = true;
    let failedTestCaseIndex = null;

    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      const inputFilePath = path.join(filePath, `input_${timestamp}.txt`);
      const outputFilePath = path.join(filePath, `output_${timestamp}.txt`);
      await downloadFile(testCase.inputFileUrl, inputFilePath);
      await downloadFile(testCase.outputFileUrl, outputFilePath);
      const input = fs.readFileSync(inputFilePath, "utf-8");
      const expectedOutput = fs.readFileSync(outputFilePath, "utf-8");
      const result = await executeCode(fileName, command, input, expectedOutput, code, timeLimit, memoryLimit);
      fs.unlinkSync(inputFilePath);
      fs.unlinkSync(outputFilePath);
      if (!result.isCorrect) {
        allCorrect = false;
        failedTestCaseIndex = i + 1;
        break;
      }
    }

    const attempt = new Attempt({
      studentId,
      problemId: problem._id,
      code,
      language,
      isCorrect: allCorrect,
      failedTestCaseIndex,
      timeLimit,
      memoryLimit,
    });
    await attempt.save();
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ status: "error", message: "Student not found" });
    }

    if (student.balance === null) student.balance = 0;
    if (allCorrect && isFirstAttemptCorrect) student.balance += point;
    if (!student.history.includes(problem._id)) student.history.push(problem._id);
    await student.save();
    fs.unlinkSync(path.join(filePath, fileName));
    return res.json({
      status: "success",
      data: {
        correct: allCorrect,
        failedTestCaseIndex,
        balance: student.balance,
        history: student.history,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: extractErrorMessage(error.message),
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
