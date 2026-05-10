import { db } from "@/lib/dynamodb";
import {
  ScanCommand,
  UpdateCommand
} from "@aws-sdk/lib-dynamodb";

export async function PATCH(req) {
  const { oldTodo, newTodo } = await req.json();

  const data = await db.send(
    new ScanCommand({
      TableName: "todos"
    })
  );

  const task = data.Items.find(
    item =>
      item.todo.toLowerCase() === oldTodo.toLowerCase()
  );

  if (!task) {
    return Response.json(
      { error: "Todo not found"
      },
      { status: 404 }
    );
  }

  await db.send(
    new UpdateCommand({
      TableName: "todos",
      Key: { id: task.id },
      UpdateExpression: "SET #todo = :newTodo",
      ExpressionAttributeNames: {
        "#todo": "todo"
      },
      ExpressionAttributeValues: {
        ":newTodo": newTodo
      }
    })
  );

  return Response.json({
    success: true
  });
}