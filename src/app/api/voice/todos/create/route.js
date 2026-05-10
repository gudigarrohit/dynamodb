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

    const todoText =
      body.todo ||
      body.parameters?.todo;

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

    return Response.json({
      results: [
        {
          toolCallId,
          result: `Task "${todoText}" created successfully`
        }
      ]
    });

  } catch (error) {
    console.log(error);

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