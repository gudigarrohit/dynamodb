import { db } from "@/lib/dynamodb";
import {
  PutCommand
} from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";

// CREATE
export async function POST(req) {
  try {
    const body = await req.json();

    console.log("Incoming body:", body);

    const toolCallId =
      body.message?.toolCalls?.[0]?.id ||
      body.toolCallId ||
      "default-call-id";

  const toolCall =
  body.message?.toolCalls?.[0];

console.log("Tool Call Data:", toolCall);

const todoText =
  body.todo ||
  body.parameters?.todo ||
  toolCall?.function?.arguments?.todo ||
  toolCall?.arguments?.todo;

console.log("Extracted Todo:", todoText);
    if (!todoText || todoText.trim() === "") {
      return Response.json({
        results: [
          {
            toolCallId,
            result: "Todo cannot be empty"
          }
        ]
      });
    }

    const newTodo = {
      id: uuidv4(),
      todo: todoText,
      isCompleted: false,
      createdAt: new Date().toISOString(),
    };

    await db.send(
      new PutCommand({
        TableName: "todos",
        Item: newTodo,
      })
    );
    console.log("Created Todo:", newTodo);
    return Response.json({
      results: [
        {
          toolCallId,
          result: `Successfully added task: ${todoText}`
        }
      ]
    });

  } catch (error) {
    console.error("Create Todo Error:", error);
    return Response.json({
      results: [
        {
          toolCallId: "error",
          result: "Failed to create todo"
        }
      ]
    });
  }
}