#! /usr/bin/env node
const { spawn, exec } = require('child_process');
const fs = require('fs');

const filePathRegex = /.\/src\/[^\s]+\/[^s]+\.(ts|tsx|js|jsx):([0-9]{2})/g;
const lineNumberRegex = /:([0-9]{2})/g;
const dateRegex = /[\s]\d{4}-\d{2}-\d{2}/g;

const userEnteredCommand = process.argv[2];
const userEnteredCommandParts = userEnteredCommand.split(' ');
const userStringToMatch = process.argv[3];
const userEnteredNameOfDev = process.argv[4];

const commandToErrorMap = {};
const commandArray = [];
const devNameToErrorsMap = {};

const userProcess = spawn(userEnteredCommandParts[0], userEnteredCommandParts.slice(1));
userProcess.stdout.on('data', data => {
  const linesOfData = data.toString().split('\n\n');
  for (const line of linesOfData) {
    if (line.includes(userStringToMatch)) {
      const filePathArr = line.match(filePathRegex);
      const filePath = filePathArr && filePathArr[0];
      if (filePath) {
        const lineNumber = filePath.match(lineNumberRegex)[0].split(':')[1];
        const command = `git blame ${filePath.replace(lineNumberRegex, '')} -L${lineNumber},+1`;
        commandArray.push(command);
        commandToErrorMap[command] = line;
      }
    }
  }
});
userProcess.on('close', code => {
  console.log(`child process exited with code ${code}`);

  let allGitBlameCommands = '';
  for (let i = 0; i < commandArray.length; i++) {
    const command = commandArray[i];
    allGitBlameCommands += `${command}`;
    if (i !== commandArray.length - 1) {
      allGitBlameCommands += ' && ';
    }
  }

  exec(allGitBlameCommands, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }

    const results = stdout.split('\n');
    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      const command = commandArray[i];

      const indexOfDate = result.search(dateRegex);
      const indexOfParen = result.indexOf('(');
      const nameOfDev = result.substring(indexOfParen + 1, indexOfDate).toLowerCase();
      const devError = commandToErrorMap[command];

      if (nameOfDev) {
        devNameToErrorsMap[nameOfDev] = devNameToErrorsMap[nameOfDev] || [];
        devNameToErrorsMap[nameOfDev].push(devError);
      }
    }

    let outputStr;
    if (userEnteredNameOfDev) {
      outputStr = `\n--- ERRORS REMAINING FOR ${userEnteredNameOfDev}---\n`;
      for (const error of devNameToErrorsMap[userEnteredNameOfDev.toLocaleLowerCase()]) {
        outputStr += `${error}\n\n`;
      }
    } else {
      outputStr = '\n--- ERRORS REMAINING ---\n';
      for (const devName in devNameToErrorsMap) {
        outputStr += `Errors remaining for ${devName}: \n`;
        for (const error of devNameToErrorsMap[devName]) {
          outputStr += `${error}\n\n`;
        }
      }
    }

    console.log(outputStr);
  });
});