import { db } from "@/lib/dynamodb";
import {
  PutCommand,
  ScanCommand,
  DeleteCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";

// GET
export async function GET() {
  const data = await db.send(
    new ScanCommand({ TableName: "todos" })
  );
  return Response.json(data.Items || []);
}

// CREATE
export async function POST(req) {
  const body = await req.json();

  await db.send(
    new PutCommand({
      TableName: "todos",
      Item: body,
    })
  );

  return Response.json({ success: true });
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

  return Response.json({ success: true });
}

// UPDATE
export async function PATCH(req) {
  const { id, todo, isCompleted } = await req.json();

  await db.send(
    new UpdateCommand({
      TableName: "todos",
      Key: { id },
      UpdateExpression: "SET #t = :t, isCompleted = :c",
      ExpressionAttributeNames: { "#t": "todo" },
      ExpressionAttributeValues: {
        ":t": todo,
        ":c": isCompleted,
      },
    })
  );

  return Response.json({ success: true });
}