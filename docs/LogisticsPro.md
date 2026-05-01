# LogisticsPro Functionality & AI Features

This file lists what the system can do in simple terms.

## Core Functionality

- User login and secure access using Clerk authentication.
- Role-based access (for example, admin-only actions like creating warehouses and carriers).
- Warehouse management:
  - View all warehouses.
  - Add a new warehouse.
  - View capacity and current inventory usage.
- Carrier management:
  - View all carriers.
  - Add new carriers.
- Shipment management:
  - Create shipments.
  - View all shipments with full details (origin, destination, carrier, and events).
  - View a single shipment by ID.
- Shipment tracking updates:
  - Add shipment events (status updates, location, description).
  - Shipment status is updated automatically when a new event is added.
- Dashboard workflow support:
  - Dedicated pages for shipments, warehouses, carriers, route planning, and settings.
- System health endpoints:
  - Basic root and health check endpoints for service monitoring.

## AI Features

- AI delay risk prediction (background automation):
  - The system regularly checks active shipments.
  - It predicts delay risk level (Low/Medium/High).
  - It gives a short reason for each risk prediction.
- AI warehouse demand forecast:
  - Predicts how many days until stockout.
  - Recommends restock quantity.
  - Provides short reasoning.
- AI smart route optimization:
  - Takes multiple selected shipments.
  - Generates an optimized multi-stop route.
  - Returns estimated total time and route reasoning.
- AI logistics chat assistant:
  - Users can ask logistics questions in chat.
  - AI answers based on live shipment and warehouse data available in the system.

## User-Facing Benefits (Simple View)

- Better visibility across shipments and warehouses.
- Faster decision-making for routing and inventory.
- Early warning for possible shipment delays.
- Quick logistics insights through chat without manual reporting.
