from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID

class WarehouseBase(BaseModel):
    name: str
    location: str
    capacity: Optional[int] = None
    manager_id: Optional[str] = None
    current_inventory: Optional[int] = 0

class WarehouseCreate(WarehouseBase):
    pass

class Warehouse(WarehouseBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

class CarrierBase(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None

class CarrierCreate(CarrierBase):
    pass

class Carrier(CarrierBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

class ShipmentEventBase(BaseModel):
    status: str
    location: Optional[str] = None
    description: Optional[str] = None
    timestamp: Optional[datetime] = None

class ShipmentEventCreate(ShipmentEventBase):
    shipment_id: UUID

class ShipmentEvent(ShipmentEventBase):
    id: UUID
    shipment_id: UUID
    timestamp: datetime

    class Config:
        from_attributes = True

class ShipmentBase(BaseModel):
    tracking_number: str
    origin_id: Optional[UUID] = None
    destination_id: Optional[UUID] = None
    carrier_id: Optional[UUID] = None
    status: str = "Pending"
    estimated_delivery: Optional[datetime] = None
    customer_id: Optional[str] = None
    supplier_id: Optional[str] = None
    delay_risk: Optional[str] = None
    delay_reason: Optional[str] = None

class ShipmentCreate(ShipmentBase):
    pass

class Shipment(ShipmentBase):
    id: UUID
    created_at: datetime
    events: List[ShipmentEvent] = []
    origin: Optional[dict] = None
    destination: Optional[dict] = None
    carrier: Optional[dict] = None

    class Config:
        from_attributes = True

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    reply: str

class ForecastResponse(BaseModel):
    predicted_stockout_days: int
    recommended_restock_amount: int
    reasoning: str

class RouteOptimizationRequest(BaseModel):
    shipment_ids: List[str]

class RouteWaypoint(BaseModel):
    location: str
    action: str
    estimated_arrival: str

class RouteOptimizationResponse(BaseModel):
    optimized_route: List[RouteWaypoint]
    total_estimated_time: str
    reasoning: str
