import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { level, message, data } = body;
    
    const timestamp = new Date().toISOString();
    const prefix = level === "error" ? "❌" : level === "warn" ? "⚠️" : level === "info" ? "🔵" : "✅";
    
    if (data) {
      console.log(`${prefix} [${timestamp}] ${message}`, data);
    } else {
      console.log(`${prefix} [${timestamp}] ${message}`);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao processar log:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}














