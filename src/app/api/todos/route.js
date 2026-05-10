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
  const body = await req.json();
  const newTodo = {
    id: uuidv4(),
    todo: body.todo, isCompleted: false,
    createdAt: new Date().toISOString(),
  };
  await db.send(new PutCommand({ TableName: "todos", Item: newTodo, }));
  return Response.json(newTodo);
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