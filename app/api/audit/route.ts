import { NextRequest, NextResponse } from "next/server";
import { auditService } from "@/lib/governance/audit";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const id = searchParams.get("id");

  if (id) {
    const record = auditService.getById(id);
    if (!record) {
      return NextResponse.json({ error: "Audit record not found" }, { status: 404 });
    }
    return NextResponse.json({ record });
  }

  const audits = auditService.getAll();
  const stats = auditService.getStats();

  return NextResponse.json({
    audits,
    stats,
  });
}
