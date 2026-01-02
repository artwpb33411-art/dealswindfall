// app/api/analytics/log/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type AnalyticsEventBody = {
  event_name: string;              // "page_view" | "deal_click" | "deal_outbound_click"
  event_type?: string;             // "view" | "click" | "other"
  page?: string | null;
  referrer?: string | null;
  device?: string | null;
  metadata?: Record<string, any> | null;
  deal_id?: number | null;
  store?: string | null;
  category?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  visitor_id?: string | null;
};

function inferEventType(eventName?: string | null): string | null {
  if (!eventName) return null;
  if (eventName.includes("view")) return "view";
  if (eventName.includes("click")) return "click";
  return "other";
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as AnalyticsEventBody;

    if (!body.event_name) {
      return NextResponse.json(
        { error: "event_name is required" },
        { status: 400 }
      );
    }

    // crude payload size guard
    if (JSON.stringify(body).length > 10_000) {
      return NextResponse.json(
        { error: "Payload too large" },
        { status: 413 }
      );
    }

    const userAgent = req.headers.get("user-agent");
    const forwardedFor = req.headers.get("x-forwarded-for") || "";
    const ip =
      forwardedFor.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      null;

    const {
      event_name,
      event_type,
      page,
      referrer,
      device,
      metadata,
      deal_id,
      store,
      category,
      utm_source,
      utm_medium,
      utm_campaign,
      visitor_id,
    } = body;

           // =========================================
    // Deal Page Views (normalized: slug + ?deal)
    // =========================================
    if (event_name === "deal_page_view") {
      let resolvedDealId: number | null = null;

      // 1️⃣ Preferred: explicit deal_id from client (?deal=ID)
      if (typeof deal_id === "number" && !Number.isNaN(deal_id)) {
        resolvedDealId = deal_id;
      }

      // 2️⃣ Fallback: parse from slug URL (/deals/ID-slug)
      else if (page?.includes("/deals/")) {
        const slugPart = page.split("/deals/")[1];
        const parsed = Number(slugPart?.split("-")[0]);
        if (!Number.isNaN(parsed)) {
          resolvedDealId = parsed;
        }
      }

      if (resolvedDealId !== null) {
        const { error: dealViewError } = await supabaseAdmin
          .from("deal_page_views")
          .insert({
            deal_id: resolvedDealId,
            path: page ?? null,
            referrer: referrer ?? null,
            user_agent: userAgent,
            created_at: new Date().toISOString(),
          });

        if (dealViewError) {
          console.error("deal_page_views insert error:", dealViewError);
        }
      }
    }


    const { error } = await supabaseAdmin.from("analytics").insert({
      event_name,
      event_type: event_type ?? inferEventType(event_name),
      page: page ?? null,
      referrer: referrer ?? null,
      device: device ?? null,
      metadata: metadata ?? {},
      created_at: new Date().toISOString(),
      deal_id: deal_id ?? null,
      store: store ?? null,
      category: category ?? null,
      user_agent: userAgent,
      ip_address: ip,
      utm_source: utm_source ?? null,
      utm_medium: utm_medium ?? null,
      utm_campaign: utm_campaign ?? null,
      visitor_id: visitor_id ?? null,
    });

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("Analytics log error:", e);
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
