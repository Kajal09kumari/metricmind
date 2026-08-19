import { NextRequest, NextResponse } from "next/server";
import { AgentTools } from "@/lib/agent/tools";
import { SemanticQuery } from "@/types";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body: SemanticQuery = await req.json();
    const result = await AgentTools.querySemanticLayer(body);

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to execute semantic query",
      },
      { status: 400 }
    );
  }
}
