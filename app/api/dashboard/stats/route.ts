import { NextResponse } from "next/server"
import { DASHBOARD_STATS_MOCK } from "@/lib/mock-data"
import type { ApiResponse, DashboardStats } from "@/types"

export async function GET() {
  try {
    const response: ApiResponse<DashboardStats> = { data: DASHBOARD_STATS_MOCK, success: true }
    return NextResponse.json(response)
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json(
      { data: null, success: false, message: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
