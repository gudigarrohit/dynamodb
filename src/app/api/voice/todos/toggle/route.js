import { db } from "@/lib/dynamodb";
import {
  ScanCommand,
  UpdateCommand
} from "@aws-sdk/lib-dynamodb";

export async function POST(req) {
  try {
    const body = await req.json();

    console.log("Toggle request body:", body);

    const toolCallId =
      body.message?.toolCalls?.[0]?.id ||
      body.toolCallId ||
      "default-call-id";

    const todo =
      body.todo ||
      body.parameters?.todo;

    if (!todo) {
      return Response.json({
        results: [
          {
            toolCallId,
            result: "Todo name is required"
          }
        ]
      });
    }

    // Fetch all todos
    const data = await db.send(
      new ScanCommand({
        TableName: "todos"
      })
    );

    const task = data.Items.find(
      (item) =>
        item.todo.toLowerCase() ===
        todo.toLowerCase()
    );

    if (!task) {
      return Response.json({
        results: [
          {
            toolCallId,
            result: "Todo not found"
          }
        ]
      });
    }

    // Toggle status
    const newStatus = !task.isCompleted;

    await db.send(
      new UpdateCommand({
        TableName: "todos",
        Key: {
          id: task.id
        },
        UpdateExpression:
          "SET isCompleted = :status",
        ExpressionAttributeValues: {
          ":status": newStatus
        }
      })
    );

    return Response.json({
      results: [
        {
          toolCallId,
          result: newStatus
            ? "Task marked as completed"
            : "Task marked as incomplete"
        }
      ]
    });

  } catch (error) {
    console.error("Toggle Error:", error);

    return Response.json({
      results: [
        {
          toolCallId: "error",
          result: "Failed to update task status"
        }
      ]
    });
  }
}