import { NextRequest, NextResponse } from "next/server";
import { agentController } from "@/lib/agent/agent-controller";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { question } = body;

    if (!question || typeof question !== "string") {
      return NextResponse.json(
        { error: "Question string is required" },
        { status: 400 }
      );
    }

    const state = await agentController.executeWorkflow(question);

    return NextResponse.json({
      success: !state.error,
      state,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to process query through Semantic Agent",
      },
      { status: 500 }
    );
  }
}
