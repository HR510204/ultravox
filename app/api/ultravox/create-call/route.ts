import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const {
      systemPrompt,
      temperature = 0.1,
      voice = null,
    } = await request.json();

    // Your Ultravox API key should be stored in environment variables
    const apiKey = process.env.ULTRAVOX_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Ultravox API key not configured" },
        { status: 500 }
      );
    }

    // Create a call with Ultravox API
    const response = await fetch("https://api.ultravox.ai/api/calls", {
      method: "POST",
      headers: {
        "X-API-Key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        systemPrompt,
        temperature,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Ultravox API error:", error);
      return NextResponse.json(
        { error: "Failed to create Ultravox call" },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      joinUrl: data.joinUrl,
      callId: data.callId,
    });
  } catch (error) {
    console.error("Error creating Ultravox call:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
