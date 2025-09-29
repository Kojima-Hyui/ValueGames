import { NextRequest, NextResponse } from "next/server";
import { itadSearchByTitle } from "@/lib/itad";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query");
  
  if (!query || query.trim().length === 0) {
    return NextResponse.json({ error: "Query parameter is required" }, { status: 400 });
  }

  try {
    const results = await itadSearchByTitle(query.trim(), 20);
    
    // フィルタリング: ゲームのみ（DLCやパッケージを除外）
    const games = results.filter((item: { type?: string }) => 
      item.type === "game" || !item.type
    );

    return NextResponse.json({ data: games }, {
      headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=60" },
    });
  } catch (error: unknown) {
    console.error("Search API error:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}