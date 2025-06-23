import { OpenAI } from "openai";
import "dotenv/config";
import { exec } from "node:child_process";
import { writeFileSync, mkdirSync } from "node:fs";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const client = new OpenAI({ apiKey: OPENAI_API_KEY });

function getWeatherInfo(city) {
  // This function would typically call an external API to get weather information.
  // For this example, we'll just return a mock response.
  return `Weather in ${city}: 75°F with clear skies.`;
}

function executeCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, function (err, stdout, stderr) {
      if (err) {
        return reject(err);
      }
      resolve(`stdout: ${stdout}\nstderr: ${stderr}`);
    });
  });
}

function createFile(filePath, content) {
  try {
    // Create directory if it doesn't exist
    const dir = filePath.split("/").slice(0, -1).join("/");
    if (dir) {
      mkdirSync(dir, { recursive: true });
    }

    writeFileSync(filePath, content);
    return `File created successfully: ${filePath}`;
  } catch (error) {
    return `Error creating file: ${error.message}`;
  }
}

const ToolsMap = {
  getWeatherInfo: getWeatherInfo,
  executeCommand: executeCommand,
  createFile: createFile,
};

const SYSTEM_PROMPT = `
    You are a helpful assistant who is designed to resolve users query.
    You work on START, THINK, ACTION, OBSERVE, AND OUTPUT mode.

    In the START mode, user will provide you with a query.
    Then, In the THINK mode, you will think how to resolve the query atleast 3-4 times and make sure that you have understood the query correctly and smartly.
    If there is a need to call tool, you call an ACTION event with the tool name and parameters.
    If there is an ACTION call, wait for the OBSERVE mode to observe the output of the tool.
    Based on the OBSERVE from the prev step, you will decide whether to provide the final OUTPUT or repeat the loop again.

    Rules:
    - Always wait for next step.
    - Always output a single step and wait for the next step.
    - Output must be strictily JSON format.
    - Only call tool action from Available tools only.
    - Strictly follow the output format in JSON.

    Available tools:
    - getWeatherInfo(city: string): Get the weather information for a given city(string).
    - executeCommand(command: string): Execute a shell command and return the STDOUT and STDERR.
    - createFile(filePath: string, content: string): Create a file with the given content and return a success message or error message.

    For creating files with content, prefer using createFile tool over executeCommand with echo, as it handles escaping automatically.

    Example:
    START: What is the weather in New York?
    ThINK: The user is asking for the weather information for New York.
    THINK: From the available tools, I must use getWeatherInfo to get the weather information with the city parameter as "New York".
    ACTION: Call tool getWeatherInfo("New York")
    OBSERVE: 75°F with clear skies
    THINK: The output of getWeatherInfo is 75°F with clear skies.
    OUTPUT: The weather in New York is 75°F with clear skies which is quite pleasant today.

    Output Example:
    { "role": "user", "conternt": "What is the weather in New York?" }
    { "step": "START", "content": "What is the weather in New York?" }
    { "step": "THINK", "content": "The user is asking for the weather information for New York." }
    { "step": "THINK", "content": "From the available tools, I must use getWeatherInfo to get the weather information with the city parameter as 'New York'." }
    { "step": "ACTION", "tool": "getWeatherInfo", "input": "{\"city\": \"New York\"}"}
    { "step": "OBSERVE", "content": "75°F with clear skies." }
    { "step": "THINK", "content": "The output of getWeatherInfo is 75°F with clear skies." }
    { "step": "OUTPUT", "content": "The weather in New York is 75°F with clear skies which is quite pleasant today." }

    Output Format:
    { "step": ""string", "tool": "string": "input": "string", "content": "string" }
`;

async function init() {
  const messages = [
    {
      role: "system",
      content: SYSTEM_PROMPT,
    },
  ];

  const userQuery =
    "Create a fully functional and working rock, paper, scissors using html, css and js inside the folder rock-paper-scissor where user can also play against computer and also show the score of user and computer in the game. It should also have a button to reset the game and show the winner at the end of the game and also choice of choosing whom to play against like computer or another player. The game should be fully functional and working and should be able to run in the browser.";
  messages.push({ role: "user", content: userQuery });

  while (true) {
    const response = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      response_format: {
        type: "json_object",
      },
      messages: messages,
    });
    messages.push({
      role: "assistant",
      content: response.choices[0].message.content,
    });

    let parsedContent;
    try {
      parsedContent = JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.log(`❌ JSON Parse Error: ${error.message}`);
      console.log(`Raw response: ${response.choices[0].message.content}`);
      // Add error message to continue the conversation
      messages.push({
        role: "assistant",
        content: JSON.stringify({
          step: "OBSERVE",
          content:
            "Error: Invalid JSON response. Please try again with proper JSON format.",
        }),
      });
      continue;
    }

    if (parsedContent.step && parsedContent.step === "THINK") {
      console.log(`🧠: ${parsedContent.content}`);
      continue;
    }

    if (parsedContent.step && parsedContent.step === "OUTPUT") {
      console.log(`🤖: ${parsedContent.content}`);
      break;
    }

    if (parsedContent.step && parsedContent.step === "ACTION") {
      const toolName = parsedContent.tool;
      const toolInput = JSON.parse(parsedContent.input);

      let value;
      if (toolName === "executeCommand") {
        value = await ToolsMap[toolName]?.(toolInput.command);
      } else if (toolName === "createFile") {
        value = await ToolsMap[toolName]?.(
          toolInput.filePath,
          toolInput.content
        );
      } else {
        value = await ToolsMap[toolName]?.(toolInput);
      }

      console.log(
        `🔧: Tool Call: ${toolName}: (${JSON.stringify(toolInput)}): ${value}`
      );

      messages.push({
        role: "assistant",
        content: JSON.stringify({
          step: "OBSERVE",
          content: value,
        }),
      });
      continue;
    }
  }
}

init();
