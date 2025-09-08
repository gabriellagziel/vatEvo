import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { name, email, company, message } = await req.json();

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }

    const provider = process.env.LEADS_PROVIDER;
    
    if (provider === "airtable") {
      const apiKey = process.env.AIRTABLE_API_KEY;
      const baseId = process.env.AIRTABLE_BASE_ID;
      const table = process.env.AIRTABLE_TABLE_NAME || "Leads";
      
      if (!apiKey || !baseId) {
        throw new Error("Missing Airtable configuration");
      }
      
      const res = await fetch(`https://api.airtable.com/v0/${baseId}/${encodeURIComponent(table)}`, {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${apiKey}`, 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify({ 
          fields: { 
            Name: name, 
            Email: email, 
            Company: company || "", 
            Message: message || "", 
            Source: "marketing",
            Created: new Date().toISOString()
          } 
        })
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Airtable error: ${errorText}`);
      }
      
      return NextResponse.json({ ok: true });
      
    } else if (provider === "supabase") {
      const url = process.env.SUPABASE_URL;
      const key = process.env.SUPABASE_ANON_KEY;
      
      if (!url || !key) {
        throw new Error("Missing Supabase configuration");
      }
      
      const res = await fetch(`${url}/rest/v1/leads`, {
        method: "POST",
        headers: { 
          "apikey": key, 
          "Authorization": `Bearer ${key}`, 
          "Content-Type": "application/json", 
          "Prefer": "return=representation" 
        },
        body: JSON.stringify({ 
          name, 
          email, 
          company: company || null, 
          message: message || null, 
          source: "marketing",
          created_at: new Date().toISOString()
        })
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Supabase error: ${errorText}`);
      }
      
      return NextResponse.json({ ok: true });
      
    } else {
      return NextResponse.json({ 
        error: "Lead capture is not configured. Please email us directly at contact@vatevo.com" 
      }, { status: 503 });
    }
    
  } catch (error: any) {
    console.error("Lead capture error:", error);
    return NextResponse.json({ 
      error: error.message || "Lead capture failed. Please try again or email contact@vatevo.com" 
    }, { status: 500 });
  }
}
