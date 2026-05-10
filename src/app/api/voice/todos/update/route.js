import { db } from "@/lib/dynamodb";
import {
  ScanCommand,
  UpdateCommand
} from "@aws-sdk/lib-dynamodb";

export async function POST(req) {
  try {
    const body = await req.json();

    console.log("Incoming Update Body:", body);

    const toolCall =
      body.message?.toolCalls?.[0];

    const toolCallId =
      toolCall?.id ||
      body.toolCallId ||
      "default-call-id";

    // Extract old todo
    const oldTodo =
      body.oldTodo ||
      body.parameters?.oldTodo ||
      toolCall?.function?.arguments?.oldTodo ||
      toolCall?.arguments?.oldTodo;

    // Extract new todo
    const newTodo =
      body.newTodo ||
      body.parameters?.newTodo ||
      toolCall?.function?.arguments?.newTodo ||
      toolCall?.arguments?.newTodo;

    console.log("Old Todo:", oldTodo);
    console.log("New Todo:", newTodo);

    if (!oldTodo || !newTodo) {
      return Response.json({
        results: [
          {
            toolCallId,
            result:
              "Both oldTodo and newTodo are required"
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

    // Update todo
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
          result: `Task updated successfully from "${oldTodo}" to "${newTodo}"`
        }
      ]
    });

  } catch (error) {
    console.error("Update Error:", error);

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