import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)

res = supabase.table("shipments").select("*").limit(1).execute()
if res.data:
    shipment_id = res.data[0]['id']
    try:
        supabase.table("shipments").update({"delay_risk": "Low"}).eq("id", shipment_id).execute()
        print("Success updating delay_risk")
    except Exception as e:
        print(f"Error updating delay_risk: {e}")
else:
    print("No shipments found")
