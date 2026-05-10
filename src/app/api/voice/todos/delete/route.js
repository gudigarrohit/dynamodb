import { db } from "@/lib/dynamodb";
import {
  ScanCommand,
  DeleteCommand
} from "@aws-sdk/lib-dynamodb";

export async function POST(req) {
  try {
    const body = await req.json();

    const toolCallId =
      body.message?.toolCalls?.[0]?.id ||
      "default-call-id";

    const todo =
      body.todo ||
      body.parameters?.todo;

    const data = await db.send(
      new ScanCommand({
        TableName: "todos"
      })
    );

    const task = data.Items.find(
      item =>
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

    await db.send(
      new DeleteCommand({
        TableName: "todos",
        Key: {
          id: task.id
        }
      })
    );

    return Response.json({
      results: [
        {
          toolCallId,
          result: "Task deleted successfully"
        }
      ]
    });

  } catch (error) {
    console.error(error);

    return Response.json({
      results: [
        {
          toolCallId: "error",
          result: "Failed to delete task"
        }
      ]
    });
  }
}