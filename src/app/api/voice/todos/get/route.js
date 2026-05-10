import { db } from "@/lib/dynamodb";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";

export async function POST(req) {
  try {
    const body = await req.json();

    console.log("Incoming GetTodos Body:", body);

    const toolCall =
      body.message?.toolCalls?.[0];

    const toolCallId =
      toolCall?.id ||
      body.toolCallId ||
      "default-call-id";

    // Fetch all todos
    const data = await db.send(
      new ScanCommand({
        TableName: "todos"
      })
    );

    const todos = data.Items || [];

    const pendingTodos = todos.filter(
      (item) => !item.isCompleted
    );

    const completedTodos = todos.filter(
      (item) => item.isCompleted
    );

    let responseMessage = "";

    if (todos.length === 0) {
      responseMessage =
        "Your todo list is empty.";
    } else {
      responseMessage = `You have ${pendingTodos.length} pending tasks and ${completedTodos.length} completed tasks. `;

      if (pendingTodos.length > 0) {
        responseMessage += `Pending tasks are: ${pendingTodos
          .map((task) => task.todo)
          .join(", ")}. `;
      }

      if (completedTodos.length > 0) {
        responseMessage += `Completed tasks are: ${completedTodos
          .map((task) => task.todo)
          .join(", ")}.`;
      }
    }

    return Response.json({
      results: [
        {
          toolCallId,
          result: responseMessage
        }
      ]
    });

  } catch (error) {
    console.error("GetTodos Error:", error);

    return Response.json({
      results: [
        {
          toolCallId: "error",
          result:
            "Failed to fetch your todo list."
        }
      ]
    });
  }
}