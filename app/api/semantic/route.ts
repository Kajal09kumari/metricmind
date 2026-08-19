import { NextRequest, NextResponse } from "next/server";
import { semanticRegistry } from "@/lib/semantic/registry";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const q = searchParams.get("q") || "";
  const category = searchParams.get("category");

  let metrics = q ? semanticRegistry.findMetricsBySearch(q) : semanticRegistry.listMetrics();
  let dimensions = q ? semanticRegistry.findDimensionsBySearch(q) : semanticRegistry.listDimensions();

  if (category) {
    metrics = metrics.filter((m) => m.category?.toLowerCase() === category.toLowerCase());
    dimensions = dimensions.filter((d) => d.category?.toLowerCase() === category.toLowerCase());
  }

  return NextResponse.json({
    metrics,
    dimensions,
    totalMetrics: metrics.length,
    totalDimensions: dimensions.length,
  });
}
