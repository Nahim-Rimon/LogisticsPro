import os
import random
import string
from datetime import datetime, timedelta
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)

def generate_random_string(length=8):
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))

def seed_data():
    print("Seeding 100 Warehouses...")
    warehouses_data = []
    cities = ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose", "Austin", "Jacksonville", "Fort Worth", "Columbus", "Charlotte", "San Francisco", "Indianapolis", "Seattle", "Denver", "Washington"]
    
    for i in range(100):
        warehouses_data.append({
            "name": f"Warehouse {generate_random_string(4)}",
            "location": f"{random.choice(cities)}, {random.choice(['CA', 'TX', 'NY', 'FL', 'IL'])}",
            "capacity": random.randint(500, 5000),
            "current_inventory": random.randint(0, 500),
            "manager_id": f"user_{generate_random_string(6)}"
        })
    
    wh_response = supabase.table("warehouses").insert(warehouses_data).execute()
    warehouse_ids = [w['id'] for w in wh_response.data]
    print(f"Inserted {len(warehouse_ids)} warehouses.")

    print("Seeding 100 Carriers...")
    carriers_data = []
    companies = ["Logistics", "Transit", "Express", "Freight", "Cargo", "Shipping", "Transport", "Movers", "Delivery", "Lines"]
    
    for i in range(100):
        carriers_data.append({
            "name": f"{generate_random_string(4)} {random.choice(companies)}",
            "email": f"contact@{generate_random_string(6).lower()}.com",
            "phone": f"+1-{random.randint(200, 999)}-{random.randint(100, 999)}-{random.randint(1000, 9999)}"
        })
    
    ca_response = supabase.table("carriers").insert(carriers_data).execute()
    carrier_ids = [c['id'] for c in ca_response.data]
    print(f"Inserted {len(carrier_ids)} carriers.")

    print("Seeding 100 Shipments...")
    shipments_data = []
    statuses = ["Pending", "In Transit", "Delivered", "Exception"]
    
    for i in range(100):
        shipments_data.append({
            "tracking_number": f"TRK-{generate_random_string(10)}",
            "origin_id": random.choice(warehouse_ids),
            "destination_id": random.choice(warehouse_ids),
            "carrier_id": random.choice(carrier_ids),
            "status": random.choice(statuses),
            "customer_id": f"cust_{generate_random_string(5)}",
            "supplier_id": f"supp_{generate_random_string(5)}"
        })
    
    sh_response = supabase.table("shipments").insert(shipments_data).execute()
    print(f"Inserted {len(sh_response.data)} shipments.")
    print("Seeding complete!")

if __name__ == "__main__":
    seed_data()
