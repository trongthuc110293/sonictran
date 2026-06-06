import { getStore } from "@netlify/blobs";
const STORE = "ttt-lai";
export default async (req, context) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers });
  const store = getStore({ name: STORE, consistency: "strong" });
  const url = new URL(req.url);
  try {
    if (req.method === "GET") {
      const key = url.searchParams.get("key");
      if (!key) { const list = await store.list(); return new Response(JSON.stringify({ keys: list.blobs.map(b=>b.key) }), { status:200, headers }); }
      const val = await store.get(key);
      return new Response(JSON.stringify({ value: val ? JSON.parse(val) : null }), { status:200, headers });
    }
    if (req.method === "POST") {
      const { key, value } = await req.json();
      if (!key) return new Response(JSON.stringify({ error:"missing key" }), { status:400, headers });
      await store.set(key, JSON.stringify(value));
      return new Response(JSON.stringify({ ok:true }), { status:200, headers });
    }
    if (req.method === "DELETE") {
      const key = url.searchParams.get("key");
      if (key) await store.delete(key);
      return new Response(JSON.stringify({ ok:true }), { status:200, headers });
    }
  } catch(err) {
    return new Response(JSON.stringify({ error: err.message }), { status:500, headers });
  }
};
export const config = { path: "/api/data" };
