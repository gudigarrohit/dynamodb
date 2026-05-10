import { db } from "@/lib/dynamodb";
import {
  ScanCommand,
  DeleteCommand
} from "@aws-sdk/lib-dynamodb";

export async function DELETE(req) {
  const { todo } = await req.json();

  const data = await db.send(
    new ScanCommand({
      TableName: "todos"
    })
  );

  const task = data.Items.find(
    item =>
      item.todo.toLowerCase() === todo.toLowerCase()
  );

  if (!task) {
    return Response.json(
      { error: "Todo not found" },
      { status: 404 }
    );
  }

  await db.send(
    new DeleteCommand({
      TableName: "todos",
      Key: { id: task.id }
    })
  );

  return Response.json({
    success: true
  });
}