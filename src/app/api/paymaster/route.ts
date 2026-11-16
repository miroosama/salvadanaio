import { NextRequest, NextResponse } from "next/server";

// Server-side proxy to the CDP paymaster. Keeps CDP_PAYMASTER_URL (a secret with
// an embedded key) off the client. Forwards the ERC-7677 paymaster JSON-RPC
// (pm_getPaymasterStubData / pm_getPaymasterData). On Base Sepolia, CDP trial
// mode sponsors by default; contract/function allowlist + spend caps get layered
// in here before mainnet.

const PAYMASTER_URL = process.env.CDP_PAYMASTER_URL;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(req: NextRequest) {
  if (!PAYMASTER_URL) {
    return NextResponse.json(
      { error: "CDP_PAYMASTER_URL is not configured" },
      { status: 500, headers: CORS_HEADERS }
    );
  }

  const body = await req.text();
  const upstream = await fetch(PAYMASTER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });

  const data = await upstream.text();
  return new NextResponse(data, {
    status: upstream.status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}
