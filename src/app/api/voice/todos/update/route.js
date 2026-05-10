import { db } from "@/lib/dynamodb";
import {
  ScanCommand,
  UpdateCommand
} from "@aws-sdk/lib-dynamodb";

export async function POST(req) {
  try {
    const body = await req.json();

    const toolCallId =
      body.message?.toolCalls?.[0]?.id ||
      "default-call-id";

    const oldTodo =
      body.oldTodo ||
      body.parameters?.oldTodo;

    const newTodo =
      body.newTodo ||
      body.parameters?.newTodo;

    const data = await db.send(
      new ScanCommand({
        TableName: "todos"
      })
    );

    const task = data.Items.find(
      item =>
        item.todo.toLowerCase() ===
        oldTodo.toLowerCase()
    );

    if (!task) {
      return Response.json({
        results: [
          {
            toolCallId,
            result: "Task not found"
          }
        ]
      });
    }

    await db.send(
      new UpdateCommand({
        TableName: "todos",
        Key: {
          id: task.id
        },
        UpdateExpression:
          "SET #todo = :newTodo",
        ExpressionAttributeNames: {
          "#todo": "todo"
        },
        ExpressionAttributeValues: {
          ":newTodo": newTodo
        }
      })
    );

    return Response.json({
      results: [
        {
          toolCallId,
          result: "Task updated successfully"
        }
      ]
    });

  } catch (error) {
    console.error(error);

    return Response.json({
      results: [
        {
          toolCallId: "error",
          result: "Failed to update task"
        }
      ]
    });
  }
}