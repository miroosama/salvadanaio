import { NextRequest, NextResponse } from "next/server";
import { generateJwt } from "@coinbase/cdp-sdk/auth";

// Mints a short-lived Coinbase Onramp session token (server-side, with our CDP
// secret key) that locks delivery to the user's own address: USDC on Base. The
// client turns this into a pay.coinbase.com URL. This is Coinbase's OWN hosted
// onramp (card / Apple Pay / Coinbase account) — NOT the Banxa embed in the
// smart wallet. The key never touches the client.

export const runtime = "nodejs"; // generateJwt needs Node crypto (Ed25519)

const CDP_HOST = "api.developer.coinbase.com";
const CDP_PATH = "/onramp/v1/token";

export async function POST(req: NextRequest) {
  const apiKeyId = process.env.CDP_API_KEY_ID;
  const apiKeySecret = process.env.CDP_API_KEY_SECRET;
  if (!apiKeyId || !apiKeySecret) {
    return NextResponse.json(
      { error: "CDP_API_KEY_ID / CDP_API_KEY_SECRET not configured" },
      { status: 500 }
    );
  }

  let address: unknown;
  try {
    address = (await req.json())?.address;
  } catch {
    // no/invalid body
  }
  if (typeof address !== "string" || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return NextResponse.json(
      { error: "A valid 0x address is required" },
      { status: 400 }
    );
  }

  try {
    const jwt = await generateJwt({
      apiKeyId,
      apiKeySecret,
      requestMethod: "POST",
      requestHost: CDP_HOST,
      requestPath: CDP_PATH,
      expiresIn: 120,
    });

    const upstream = await fetch(`https://${CDP_HOST}${CDP_PATH}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwt}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        addresses: [{ address, blockchains: ["base"] }],
        assets: ["USDC"],
      }),
    });

    const data = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      // Surface Coinbase's reason (e.g. onramp not enabled, trial limits).
      return NextResponse.json(
        { error: "Coinbase onramp token request failed", detail: data },
        { status: upstream.status }
      );
    }

    const token = data?.token ?? data?.data?.token;
    if (!token) {
      return NextResponse.json(
        { error: "No session token in Coinbase response", detail: data },
        { status: 502 }
      );
    }

    return NextResponse.json({ token });
  } catch (e) {
    return NextResponse.json(
      {
        error: "Failed to mint onramp session",
        detail: e instanceof Error ? e.message : String(e),
      },
      { status: 500 }
    );
  }
}
