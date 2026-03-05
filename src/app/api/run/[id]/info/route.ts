import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { parseVariables, getUniqueVariables } from "@/lib/prompt-variables";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: promptId } = await params;

    const prompt = await db.prompt.findUnique({
      where: { id: promptId },
      select: {
        id: true,
        title: true,
        description: true,
        content: true,
        type: true,
        isPrivate: true,
        deletedAt: true,
        category: {
          select: { name: true },
        },
      },
    });

    if (!prompt || prompt.deletedAt || prompt.isPrivate) {
      return NextResponse.json(
        { error: "not_found", message: "Prompt not found" },
        { status: 404 }
      );
    }

    const variables = getUniqueVariables(parseVariables(prompt.content));

    return NextResponse.json({
      id: prompt.id,
      title: prompt.title,
      description: prompt.description,
      type: prompt.type,
      category: prompt.category?.name || null,
      variables: variables.map((v) => ({
        name: v.name,
        defaultValue: v.defaultValue || null,
        required: !v.defaultValue,
      })),
      endpoint: `/api/run/${prompt.id}`,
      method: "POST",
    });
  } catch (error) {
    console.error("Prompt info error:", error);
    return NextResponse.json(
      { error: "server_error", message: "Something went wrong" },
      { status: 500 }
    );
  }
}
