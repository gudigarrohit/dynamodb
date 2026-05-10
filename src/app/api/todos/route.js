import { db } from "@/lib/dynamodb";
import {
  PutCommand,
  ScanCommand,
  DeleteCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";

import { v4 as uuidv4 } from "uuid";

// GET
export async function GET() {
  const data = await db.send(
    new ScanCommand({
      TableName: "todos",
    })
  );

  return Response.json(data.Items || []);
}

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
// DELETE
export async function DELETE(req) {
  const { id } = await req.json();

  await db.send(
    new DeleteCommand({
      TableName: "todos",
      Key: { id },
    })
  );

  return Response.json({
    success: true,
  });
}

// UPDATE
export async function PATCH(req) {
  const { id, todo, isCompleted } = await req.json();

  const updatedAt = new Date().toISOString();

  await db.send(
    new UpdateCommand({
      TableName: "todos",
      Key: { id },
      UpdateExpression:
        "SET #todo = :todo, isCompleted = :completed, createdAt = :time",
      
      ExpressionAttributeNames: {
        "#todo": "todo",
      },

      ExpressionAttributeValues: {
        ":todo": todo,
        ":completed": isCompleted,
        ":time": updatedAt,
      },
    })
  );

  return Response.json({
    success: true,
    updatedAt,
  });
}
//