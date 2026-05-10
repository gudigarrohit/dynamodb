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

    let parsedArgs = {};

    try {
      // Vapi sometimes sends arguments as string
      if (
        typeof toolCall?.arguments === "string"
      ) {
        parsedArgs = JSON.parse(
          toolCall.arguments
        );
      }

      // Vapi sometimes sends function arguments as string
      else if (
        typeof toolCall?.function?.arguments ===
        "string"
      ) {
        parsedArgs = JSON.parse(
          toolCall.function.arguments
        );
      }
    } catch (err) {
      console.log(
        "Argument Parse Error:",
        err
      );
    }

    // Extract todo from all possible locations
    const todo =
      body.todo ||
      body.parameters?.todo ||
      parsedArgs?.todo ||
      toolCall?.arguments?.todo ||
      toolCall?.function?.arguments?.todo ||
      body.message?.toolCallList?.[0]
        ?.arguments?.todo ||
      body.message?.toolWithToolCallList?.[0]
        ?.toolCall?.arguments?.todo ||
      body.message?.artifact?.variableValues
        ?.todo ||
      body.message?.artifact?.variables
        ?.todo;

    console.log(
      "Parsed Args:",
      parsedArgs
    );

    console.log(
      "Final Extracted Todo:",
      todo
    );

    if (!todo) {
      return Response.json({
        results: [
          {
            toolCallId,
            result:
              "Todo name is required"
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
const normalizedTodo = todo
  .toLowerCase()
  .trim()
  .replace(/[^\w\s]/g, "");

const task = data.Items.find((item) => {
  const dbTodo = item.todo
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, "");

  return (
    dbTodo.includes(normalizedTodo) ||
    normalizedTodo.includes(dbTodo)
  );
});

    if (!task) {
      return Response.json({
        results: [
          {
            toolCallId,
            result:
              "Todo not found"
          }
        ]
      });
    }

    // Delete task
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
          result:
            "Task deleted successfully"
        }
      ]
    });

  } catch (error) {
    console.error(
      "Delete Error:",
      error
    );

    return Response.json({
      results: [
        {
          toolCallId: "error",
          result:
            "Failed to delete task"
        }
      ]
    });
  }
}