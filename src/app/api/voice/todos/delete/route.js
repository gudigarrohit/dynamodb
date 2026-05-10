import { db } from "@/lib/dynamodb";
import {
  ScanCommand,
  DeleteCommand
} from "@aws-sdk/lib-dynamodb";

export async function POST(req) {
  try {
    const body = await req.json();

    console.log("Incoming Delete Body:", body);

    const toolCall =
      body.message?.toolCalls?.[0];

    const toolCallId =
      toolCall?.id ||
      body.toolCallId ||
      "default-call-id";

    // Extract todo from Postman + Vapi payloads
const todo =
  body.todo ||
  body.parameters?.todo ||
  toolCall?.function?.arguments?.todo ||
  toolCall?.arguments?.todo ||
  body.message?.toolCallList?.[0]?.arguments?.todo ||
  body.message?.toolWithToolCallList?.[0]?.toolCall?.arguments?.todo ||
  body.message?.artifact?.variableValues?.todo ||
  body.message?.artifact?.variables?.todo;

  console.log("Extracted Todo:", todo);
console.log(
  "ToolCall Arguments:",
  JSON.stringify(toolCall, null, 2)
);
console.log(
  "Variable Values:",
  body.message?.artifact?.variableValues
);

    console.log("Extracted Todo:", todo);

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

    // Delete todo
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
    console.error("Delete Error:", error);

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