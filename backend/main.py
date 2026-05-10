from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from models import (
    Warehouse, WarehouseCreate,
    Carrier, CarrierCreate,
    Shipment, ShipmentCreate, ShipmentEvent, ShipmentEventBase,
    ChatRequest, ChatResponse, ForecastResponse,
    RouteOptimizationRequest, RouteOptimizationResponse, RouteWaypoint
)
from database import get_supabase, get_scoped_client
from auth import get_current_user, require_org_admin
from webhooks import router as webhooks_router
from uuid import UUID
import os
import json
import asyncio
from contextlib import asynccontextmanager
from google import genai
from dotenv import load_dotenv

# In-memory delay-risk cache.
# Keyed by shipment UUID — globally unique across tenants, so cross-tenant
# collisions are impossible. The background task that fills it runs with the
# raw service-role client (cross-tenant by design); user-facing reads filter
# by their own org_id before merging predictions in.
delay_predictions = {}


async def predictive_delay_task():
    await asyncio.sleep(5)
    while True:
        try:
            db = get_supabase()
            res = await asyncio.to_thread(
                lambda: db.table("shipments")
                .select("id, tracking_number, status, origin_id, destination_id")
                .in_("status", ["Pending", "In Transit"])
                .execute()
            )
            shipments = res.data

            if shipments:
                prompt = f"""
                You are a logistics risk assessment AI.
                Assess the delay risk for the following shipments based on simulated external factors (e.g., weather, port congestion).
                Be creative with the reasons (e.g., 'Heavy snow in origin area', 'Port congestion at destination'). Make about 30% of them Medium or High risk.
                Shipments: {json.dumps(shipments, default=str)}

                Respond ONLY with a valid JSON array of objects, where each object has:
                - shipment_id: (the id of the shipment)
                - risk: ("Low", "Medium", "High")
                - reason: (a short 1-sentence reason for the risk level)
                """

                def _generate():
                    return gemini_client.models.generate_content(
                        model='gemini-3-flash-preview',
                        contents=prompt
                    )
                response = await asyncio.to_thread(_generate)

                try:
                    json_text = response.text.strip()
                    if json_text.startswith("```json"):
                        json_text = json_text[7:-3]
                    elif json_text.startswith("```"):
                        json_text = json_text[3:-3]

                    predictions = json.loads(json_text)
                    for p in predictions:
                        delay_predictions[str(p["shipment_id"])] = {
                            "risk": p["risk"],
                            "reason": p["reason"],
                        }
                except Exception as parse_e:
                    print("Error parsing Gemini prediction:", parse_e)
        except Exception as e:
            print("Error in predictive delay task:", e)

        await asyncio.sleep(300)


@asynccontextmanager
async def lifespan(app: FastAPI):
    task = asyncio.create_task(predictive_delay_task())
    yield
    task.cancel()


load_dotenv()

gemini_client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


app = FastAPI(title="Supply Chain Logistics API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(webhooks_router)


# =============================================================
# Warehouses
# =============================================================
@app.get("/warehouses", response_model=List[Warehouse])
async def list_warehouses(user=Depends(get_current_user)):
    db = get_scoped_client(user["org_id"])
    response = db.table("warehouses").select("*").eq("org_id", user["org_id"]).execute()
    return response.data


@app.post("/warehouses", response_model=Warehouse)
async def create_warehouse(warehouse: WarehouseCreate, user=Depends(get_current_user)):
    require_org_admin(user)
    db = get_scoped_client(user["org_id"])
    payload = warehouse.model_dump(mode='json')
    payload["org_id"] = user["org_id"]  # injected server-side; never trust the client
    response = db.table("warehouses").insert(payload).execute()
    return response.data[0]


@app.post("/warehouses/{warehouse_id}/forecast", response_model=ForecastResponse)
async def get_warehouse_forecast(warehouse_id: UUID, user=Depends(get_current_user)):
    db = get_scoped_client(user["org_id"])
    response = (
        db.table("warehouses")
        .select("*")
        .eq("id", str(warehouse_id))
        .eq("org_id", user["org_id"])
        .execute()
    )
    if not response.data:
        raise HTTPException(status_code=404, detail="Warehouse not found")

    warehouse = response.data[0]

    prompt = f"""
    You are an AI Inventory Optimization Expert.
    Analyze the following warehouse data and simulated historical order velocity to predict stockout and recommend restock amounts.

    Warehouse Name: {warehouse.get('name')}
    Location: {warehouse.get('location')}
    Capacity: {warehouse.get('capacity')}
    Current Inventory: {warehouse.get('current_inventory')}

    Simulate that order velocity is currently varying between 50 to 200 units per day.
    Determine:
    1. predicted_stockout_days: How many days until inventory hits 0?
    2. recommended_restock_amount: How many units to reorder to get back to optimal capacity?
    3. reasoning: A short, 1-2 sentence explanation.

    Respond ONLY with a valid JSON object matching this structure:
    {{
        "predicted_stockout_days": int,
        "recommended_restock_amount": int,
        "reasoning": str
    }}
    """

    try:
        gen_response = gemini_client.models.generate_content(
            model='gemini-3-flash-preview',
            contents=prompt
        )
        json_text = gen_response.text.strip()
        if json_text.startswith("```json"):
            json_text = json_text[7:-3]
        elif json_text.startswith("```"):
            json_text = json_text[3:-3]

        data = json.loads(json_text)
        return ForecastResponse(**data)
    except Exception as e:
        print(f"Error generating forecast: {e}")
        return ForecastResponse(
            predicted_stockout_days=14,
            recommended_restock_amount=500,
            reasoning="[AI Fallback due to rate limit] Based on general historical order velocity, current inventory will deplete within two weeks."
        )


# =============================================================
# Carriers
# =============================================================
@app.get("/carriers", response_model=List[Carrier])
async def list_carriers(user=Depends(get_current_user)):
    db = get_scoped_client(user["org_id"])
    response = db.table("carriers").select("*").eq("org_id", user["org_id"]).execute()
    return response.data


@app.post("/carriers", response_model=Carrier)
async def create_carrier(carrier: CarrierCreate, user=Depends(get_current_user)):
    require_org_admin(user)
    db = get_scoped_client(user["org_id"])
    payload = carrier.model_dump(mode='json')
    payload["org_id"] = user["org_id"]
    response = db.table("carriers").insert(payload).execute()
    return response.data[0]


# =============================================================
# Shipments
# =============================================================
@app.get("/shipments", response_model=List[Shipment])
async def list_shipments(user=Depends(get_current_user)):
    db = get_scoped_client(user["org_id"])
    response = (
        db.table("shipments")
        .select(
            "*, shipment_events(*), origin:warehouses!origin_id(*), "
            "destination:warehouses!destination_id(*), carrier:carriers(*)"
        )
        .eq("org_id", user["org_id"])
        .execute()
    )

    for s in response.data:
        sid = str(s["id"])
        if sid in delay_predictions:
            s["delay_risk"] = delay_predictions[sid]["risk"]
            s["delay_reason"] = delay_predictions[sid]["reason"]

    return response.data


@app.post("/shipments", response_model=Shipment)
async def create_shipment(shipment: ShipmentCreate, user=Depends(get_current_user)):
    db = get_scoped_client(user["org_id"])
    payload = shipment.model_dump(mode='json', exclude={'delay_risk', 'delay_reason'})
    payload["org_id"] = user["org_id"]
    response = db.table("shipments").insert(payload).execute()
    return response.data[0]


@app.post("/shipments/optimize-route", response_model=RouteOptimizationResponse)
async def optimize_shipments_route(
    request: RouteOptimizationRequest,
    user=Depends(get_current_user),
):
    if not request.shipment_ids:
        raise HTTPException(status_code=400, detail="No shipments provided.")

    db = get_scoped_client(user["org_id"])
    response = (
        db.table("shipments")
        .select(
            "*, origin:warehouses!origin_id(name, location), "
            "destination:warehouses!destination_id(name, location)"
        )
        .in_("id", request.shipment_ids)
        .eq("org_id", user["org_id"])
        .execute()
    )
    shipments = response.data

    if not shipments:
        raise HTTPException(status_code=404, detail="Shipments not found.")

    prompt = f"""
    You are an AI Logistics Routing Expert.
    Determine the optimal multi-stop delivery route for the following shipments to minimize total travel time and fuel costs.

    Shipments to process:
    {json.dumps(shipments, default=str)}

    Respond ONLY with a valid JSON object matching this structure:
    {{
        "optimized_route": [
            {{ "location": "Warehouse A", "action": "Pickup Shipment TRK-123", "estimated_arrival": "Day 1, 08:00 AM" }},
            ...
        ],
        "total_estimated_time": "e.g., 2 Days, 4 Hours",
        "reasoning": "A 1-sentence explanation of why this route is most efficient."
    }}
    """

    try:
        def _generate():
            return gemini_client.models.generate_content(
                model='gemini-3-flash-preview',
                contents=prompt
            )
        gen_response = await asyncio.to_thread(_generate)
        json_text = gen_response.text.strip()
        if json_text.startswith("```json"):
            json_text = json_text[7:-3]
        elif json_text.startswith("```"):
            json_text = json_text[3:-3]

        data = json.loads(json_text)
        return RouteOptimizationResponse(**data)
    except Exception as e:
        print(f"Error generating route optimization: {e}")
        mock_route = []
        for i, s in enumerate(shipments):
            origin_name = s.get("origin", {}).get("name") or "Unknown Origin"
            dest_name = s.get("destination", {}).get("name") or "Unknown Destination"
            mock_route.append(RouteWaypoint(
                location=origin_name,
                action=f"Pickup {s.get('tracking_number')}",
                estimated_arrival=f"Day 1, {8+i}:00 AM"
            ))
            mock_route.append(RouteWaypoint(
                location=dest_name,
                action=f"Deliver {s.get('tracking_number')}",
                estimated_arrival=f"Day 2, {10+i}:00 AM"
            ))

        return RouteOptimizationResponse(
            optimized_route=mock_route,
            total_estimated_time="3 Days (Simulated)",
            reasoning="[AI Fallback] Route optimized based on standard sequential pickup and delivery due to AI rate limits."
        )


@app.get("/shipments/{shipment_id}", response_model=Shipment)
async def get_shipment(shipment_id: UUID, user=Depends(get_current_user)):
    db = get_scoped_client(user["org_id"])
    response = (
        db.table("shipments")
        .select("*, shipment_events(*)")
        .eq("id", str(shipment_id))
        .eq("org_id", user["org_id"])
        .execute()
    )
    if not response.data:
        raise HTTPException(status_code=404, detail="Shipment not found")

    shipment_data = response.data[0]
    sid = str(shipment_data["id"])
    if sid in delay_predictions:
        shipment_data["delay_risk"] = delay_predictions[sid]["risk"]
        shipment_data["delay_reason"] = delay_predictions[sid]["reason"]

    return shipment_data


@app.post("/shipments/{shipment_id}/events", response_model=ShipmentEvent)
async def add_shipment_event(
    shipment_id: UUID,
    event: ShipmentEventBase,
    user=Depends(get_current_user),
):
    db = get_scoped_client(user["org_id"])

    # Verify the parent shipment belongs to the caller's org BEFORE any write.
    parent = (
        db.table("shipments")
        .select("id")
        .eq("id", str(shipment_id))
        .eq("org_id", user["org_id"])
        .execute()
    )
    if not parent.data:
        raise HTTPException(status_code=404, detail="Shipment not found")

    event_data = event.model_dump(mode='json')
    event_data["shipment_id"] = str(shipment_id)
    event_data["org_id"] = user["org_id"]

    db.table("shipments").update({"status": event.status}).eq("id", str(shipment_id)).eq(
        "org_id", user["org_id"]
    ).execute()

    response = db.table("shipment_events").insert(event_data).execute()
    return response.data[0]


# =============================================================
# Misc
# =============================================================
@app.get("/")
async def root():
    return {"message": "Supply Chain Logistics API is running"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


# =============================================================
# AI chat — context limited to caller's org
# =============================================================
@app.post("/chat", response_model=ChatResponse)
async def chat_with_ai(request: ChatRequest, user=Depends(get_current_user)):
    try:
        db = get_scoped_client(user["org_id"])
        shipments_res = (
            db.table("shipments")
            .select(
                "id, tracking_number, status, estimated_delivery, "
                "origin:warehouses!origin_id(name), "
                "destination:warehouses!destination_id(name), "
                "carrier:carriers(name)"
            )
            .eq("org_id", user["org_id"])
            .execute()
        )
        warehouses_res = (
            db.table("warehouses")
            .select("id, name, location, capacity")
            .eq("org_id", user["org_id"])
            .execute()
        )

        context_data = {
            "shipments": shipments_res.data,
            "warehouses": warehouses_res.data,
        }

        prompt = f"""
        You are a Smart AI Logistics Assistant.
        You have access to the following current logistics data (scoped to the caller's organisation only):
        {json.dumps(context_data, default=str)}

        User Query: {request.message}

        Provide a helpful, concise, and human-readable response to the user's query based ONLY on the data provided.
        If the data does not contain the answer, say that you don't have enough information right now.
        Keep it brief and conversational.
        """

        response = gemini_client.models.generate_content(
            model='gemini-3-flash-preview',
            contents=prompt
        )
        reply = response.text

    except Exception as e:
        reply = f"I'm sorry, I encountered an error while processing your request: {str(e)}"

    return ChatResponse(reply=reply)
