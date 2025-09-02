from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import sqlite3
from typing import List, Optional
from fastapi.middleware.cors import CORSMiddleware
import os
from datetime import date

# Database configuration
DATABASE = os.path.abspath("ones_to_manys.db")

def init_database():
    """Initialize the database with required tables"""
    conn = sqlite3.connect(DATABASE)
    
    # Create orders table (updated schema)
    conn.execute('''
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_id INTEGER NOT NULL,
            order_date TEXT NOT NULL,
            total_amount REAL DEFAULT 0.0
        )
    ''')
    
    # Create order_items table (updated schema)
    conn.execute('''
        CREATE TABLE IF NOT EXISTS order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            quantity INTEGER NOT NULL,
            unit_price REAL NOT NULL,
            FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE
        )
    ''')
    
    # Keep legacy tables for compatibility
    conn.execute('''
        CREATE TABLE IF NOT EXISTS master (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL
        )
    ''')
    
    conn.execute('''
        CREATE TABLE IF NOT EXISTS detail (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            master_id INTEGER NOT NULL,
            description TEXT NOT NULL,
            FOREIGN KEY (master_id) REFERENCES master (id) ON DELETE CASCADE
        )
    ''')
    
    conn.commit()
    conn.close()
    print("Database initialized successfully")

def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def calculate_order_total(order_id: int):
    """Calculate total amount for an order based on its items"""
    conn = get_db_connection()
    result = conn.execute(
        "SELECT SUM(quantity * unit_price) as total FROM order_items WHERE order_id = ?", 
        (order_id,)
    ).fetchone()
    conn.close()
    return result['total'] or 0.0

# Initialize FastAPI app
app = FastAPI()

# Initialize database on startup
init_database()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class Order(BaseModel):
    id: Optional[int] = None
    customer_id: int
    order_date: str
    total_amount: Optional[float] = 0.0

class OrderItem(BaseModel):
    id: Optional[int] = None
    order_id: int
    product_id: int
    quantity: int
    unit_price: float

class Master(BaseModel):
    id: Optional[int] = None
    name: str

class Detail(BaseModel):
    id: Optional[int] = None
    master_id: int
    description: str

@app.get("/", tags=["Root"])
def read_root():
    return {"message": "Welcome to OnesToManys API!"}

# --- Order Endpoints ---
@app.get("/orders", response_model=List[Order])
def get_orders():
    conn = get_db_connection()
    orders = conn.execute("SELECT * FROM orders").fetchall()
    conn.close()
    result = []
    for row in orders:
        order_dict = dict(row)
        # Calculate total amount
        order_dict['total_amount'] = calculate_order_total(order_dict['id'])
        result.append(Order(**order_dict))
    return result

@app.get("/orders/{order_id}", response_model=Order)
def get_order(order_id: int):
    conn = get_db_connection()
    row = conn.execute("SELECT * FROM orders WHERE id = ?", (order_id,)).fetchone()
    conn.close()
    if row:
        order_dict = dict(row)
        order_dict['total_amount'] = calculate_order_total(order_id)
        return Order(**order_dict)
    raise HTTPException(status_code=404, detail="Order not found")

@app.post("/orders", response_model=Order)
def create_order(order: Order):
    conn = get_db_connection()
    cur = conn.execute(
        "INSERT INTO orders (customer_id, order_date, total_amount) VALUES (?, ?, ?)", 
        (order.customer_id, order.order_date, order.total_amount or 0.0)
    )
    conn.commit()
    order_id = cur.lastrowid
    conn.close()
    return Order(id=order_id, customer_id=order.customer_id, order_date=order.order_date, total_amount=order.total_amount or 0.0)

@app.put("/orders/{order_id}", response_model=Order)
def update_order(order_id: int, order: Order):
    conn = get_db_connection()
    cur = conn.execute(
        "UPDATE orders SET customer_id = ?, order_date = ?, total_amount = ? WHERE id = ?", 
        (order.customer_id, order.order_date, order.total_amount or 0.0, order_id)
    )
    conn.commit()
    conn.close()
    if cur.rowcount == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Recalculate total
    total_amount = calculate_order_total(order_id)
    conn = get_db_connection()
    conn.execute("UPDATE orders SET total_amount = ? WHERE id = ?", (total_amount, order_id))
    conn.commit()
    conn.close()
    
    return Order(id=order_id, customer_id=order.customer_id, order_date=order.order_date, total_amount=total_amount)

@app.delete("/orders/{order_id}")
def delete_order(order_id: int):
    conn = get_db_connection()
    
    # Delete order items first (due to foreign key)
    conn.execute("DELETE FROM order_items WHERE order_id = ?", (order_id,))
    
    # Delete order
    cur = conn.execute("DELETE FROM orders WHERE id = ?", (order_id,))
    conn.commit()
    conn.close()
    
    if cur.rowcount == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"message": "Order deleted"}

# --- Order Items Endpoints ---
@app.get("/order-items", response_model=List[OrderItem])
def get_order_items():
    conn = get_db_connection()
    items = conn.execute("SELECT * FROM order_items").fetchall()
    conn.close()
    return [OrderItem(**dict(row)) for row in items]

@app.get("/orders/{order_id}/items", response_model=List[OrderItem])
def get_order_items_for_order(order_id: int):
    conn = get_db_connection()
    items = conn.execute("SELECT * FROM order_items WHERE order_id = ?", (order_id,)).fetchall()
    conn.close()
    return [OrderItem(**dict(row)) for row in items]

@app.get("/order-items/{item_id}", response_model=OrderItem)
def get_order_item(item_id: int):
    conn = get_db_connection()
    row = conn.execute("SELECT * FROM order_items WHERE id = ?", (item_id,)).fetchone()
    conn.close()
    if row:
        return OrderItem(**dict(row))
    raise HTTPException(status_code=404, detail="Order item not found")

@app.post("/orders/{order_id}/items", response_model=OrderItem)
def create_order_item_for_order(order_id: int, item: OrderItem):
    # Ensure the order_id matches
    item.order_id = order_id
    
    conn = get_db_connection()
    cur = conn.execute(
        "INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)", 
        (item.order_id, item.product_id, item.quantity, item.unit_price)
    )
    conn.commit()
    item_id = cur.lastrowid
    
    # Update order total
    total_amount = calculate_order_total(order_id)
    conn.execute("UPDATE orders SET total_amount = ? WHERE id = ?", (total_amount, order_id))
    conn.commit()
    conn.close()
    
    return OrderItem(id=item_id, order_id=item.order_id, product_id=item.product_id, 
                    quantity=item.quantity, unit_price=item.unit_price)

@app.post("/order-items", response_model=OrderItem)
def create_order_item(item: OrderItem):
    conn = get_db_connection()
    cur = conn.execute(
        "INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)", 
        (item.order_id, item.product_id, item.quantity, item.unit_price)
    )
    conn.commit()
    item_id = cur.lastrowid
    
    # Update order total
    total_amount = calculate_order_total(item.order_id)
    conn.execute("UPDATE orders SET total_amount = ? WHERE id = ?", (total_amount, item.order_id))
    conn.commit()
    conn.close()
    
    return OrderItem(id=item_id, order_id=item.order_id, product_id=item.product_id, 
                    quantity=item.quantity, unit_price=item.unit_price)

@app.put("/order-items/{item_id}", response_model=OrderItem)
def update_order_item(item_id: int, item: OrderItem):
    conn = get_db_connection()
    cur = conn.execute(
        "UPDATE order_items SET order_id = ?, product_id = ?, quantity = ?, unit_price = ? WHERE id = ?", 
        (item.order_id, item.product_id, item.quantity, item.unit_price, item_id)
    )
    conn.commit()
    
    if cur.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=404, detail="Order item not found")
    
    # Update order total
    total_amount = calculate_order_total(item.order_id)
    conn.execute("UPDATE orders SET total_amount = ? WHERE id = ?", (total_amount, item.order_id))
    conn.commit()
    conn.close()
    
    return OrderItem(id=item_id, order_id=item.order_id, product_id=item.product_id, 
                    quantity=item.quantity, unit_price=item.unit_price)

@app.delete("/order-items/{item_id}")
def delete_order_item(item_id: int):
    conn = get_db_connection()
    
    # Get order_id before deletion for total recalculation
    row = conn.execute("SELECT order_id FROM order_items WHERE id = ?", (item_id,)).fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Order item not found")
    
    order_id = row['order_id']
    
    # Delete item
    cur = conn.execute("DELETE FROM order_items WHERE id = ?", (item_id,))
    conn.commit()
    
    # Update order total
    total_amount = calculate_order_total(order_id)
    conn.execute("UPDATE orders SET total_amount = ? WHERE id = ?", (total_amount, order_id))
    conn.commit()
    conn.close()
    
    return {"message": "Order item deleted"}

# --- Advanced Endpoints ---
@app.post("/orders/with-items")
def create_order_with_items(data: dict):
    """Create an order with multiple items in one transaction"""
    conn = get_db_connection()
    
    try:
        # Create order
        cur = conn.execute(
            "INSERT INTO orders (customer_id, order_date, total_amount) VALUES (?, ?, ?)", 
            (data['customer_id'], data['order_date'], 0.0)
        )
        order_id = cur.lastrowid
        
        # Create items
        total_amount = 0.0
        created_items = []
        
        for item_data in data['items']:
            line_total = item_data['quantity'] * item_data['unit_price']
            total_amount += line_total
            
            cur = conn.execute(
                "INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)", 
                (order_id, item_data['product_id'], item_data['quantity'], item_data['unit_price'])
            )
            
            created_items.append({
                'id': cur.lastrowid,
                'order_id': order_id,
                'product_id': item_data['product_id'],
                'quantity': item_data['quantity'],
                'unit_price': item_data['unit_price']
            })
        
        # Update order total
        conn.execute("UPDATE orders SET total_amount = ? WHERE id = ?", (total_amount, order_id))
        conn.commit()
        conn.close()
        
        return {
            'order_id': order_id,
            'customer_id': data['customer_id'],
            'order_date': data['order_date'],
            'total_amount': total_amount,
            'items': created_items
        }
        
    except Exception as e:
        conn.rollback()
        conn.close()
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/stats")
def get_stats():
    """Get statistics about orders and items"""
    conn = get_db_connection()
    
    # Order stats
    order_stats = conn.execute("""
        SELECT 
            COUNT(*) as total_orders,
            SUM(total_amount) as total_revenue,
            COUNT(DISTINCT customer_id) as unique_customers
        FROM orders
    """).fetchone()
    
    # Product stats
    product_stats = conn.execute("""
        SELECT 
            product_id,
            SUM(quantity) as total_quantity,
            SUM(quantity * unit_price) as total_revenue
        FROM order_items
        GROUP BY product_id
    """).fetchall()
    
    # Date range
    date_range = conn.execute("""
        SELECT 
            MIN(order_date) as earliest_order,
            MAX(order_date) as latest_order
        FROM orders
    """).fetchone()
    
    conn.close()
    
    # Format product stats
    product_stats_dict = {}
    for stat in product_stats:
        product_stats_dict[str(stat['product_id'])] = {
            'quantity': stat['total_quantity'],
            'revenue': stat['total_revenue']
        }
    
    return {
        'total_orders': order_stats['total_orders'] or 0,
        'total_revenue': order_stats['total_revenue'] or 0.0,
        'unique_customers': order_stats['unique_customers'] or 0,
        'product_stats': product_stats_dict,
        'date_range': {
            'earliest_order': date_range['earliest_order'],
            'latest_order': date_range['latest_order']
        }
    }

# --- Legacy Master Endpoints (for compatibility) ---
@app.get("/masters", response_model=List[Master])
def get_masters():
    conn = get_db_connection()
    masters = conn.execute("SELECT * FROM master").fetchall()
    conn.close()
    return [Master(**dict(row)) for row in masters]

@app.get("/masters/{master_id}", response_model=Master)
def get_master(master_id: int):
    conn = get_db_connection()
    row = conn.execute("SELECT * FROM master WHERE id = ?", (master_id,)).fetchone()
    conn.close()
    if row:
        return Master(**dict(row))
    raise HTTPException(status_code=404, detail="Master not found")

@app.post("/masters", response_model=Master)
def create_master(master: Master):
    conn = get_db_connection()
    cur = conn.execute("INSERT INTO master (name) VALUES (?)", (master.name,))
    conn.commit()
    master_id = cur.lastrowid
    conn.close()
    return Master(id=master_id, name=master.name)

@app.put("/masters/{master_id}", response_model=Master)
def update_master(master_id: int, master: Master):
    conn = get_db_connection()
    cur = conn.execute("UPDATE master SET name = ? WHERE id = ?", (master.name, master_id))
    conn.commit()
    conn.close()
    if cur.rowcount == 0:
        raise HTTPException(status_code=404, detail="Master not found")
    return Master(id=master_id, name=master.name)

@app.delete("/masters/{master_id}")
def delete_master(master_id: int):
    conn = get_db_connection()
    cur = conn.execute("DELETE FROM master WHERE id = ?", (master_id,))
    conn.commit()
    conn.close()
    if cur.rowcount == 0:
        raise HTTPException(status_code=404, detail="Master not found")
    return {"message": "Master deleted"}

# --- Legacy Detail Endpoints (for compatibility) ---
@app.get("/details", response_model=List[Detail])
def get_details():
    conn = get_db_connection()
    details = conn.execute("SELECT * FROM detail").fetchall()
    conn.close()
    return [Detail(**dict(row)) for row in details]

@app.get("/masters/{master_id}/details", response_model=List[Detail])
def get_details_for_master(master_id: int):
    conn = get_db_connection()
    details = conn.execute("SELECT * FROM detail WHERE master_id = ?", (master_id,)).fetchall()
    conn.close()
    return [Detail(**dict(row)) for row in details]

@app.get("/details/{detail_id}", response_model=Detail)
def get_detail(detail_id: int):
    conn = get_db_connection()
    row = conn.execute("SELECT * FROM detail WHERE id = ?", (detail_id,)).fetchone()
    conn.close()
    if row:
        return Detail(**dict(row))
    raise HTTPException(status_code=404, detail="Detail not found")

@app.post("/details", response_model=Detail)
def create_detail(detail: Detail):
    conn = get_db_connection()
    cur = conn.execute("INSERT INTO detail (master_id, description) VALUES (?, ?)", (detail.master_id, detail.description))
    conn.commit()
    detail_id = cur.lastrowid
    conn.close()
    return Detail(id=detail_id, master_id=detail.master_id, description=detail.description)

@app.put("/details/{detail_id}", response_model=Detail)
def update_detail(detail_id: int, detail: Detail):
    conn = get_db_connection()
    cur = conn.execute("UPDATE detail SET master_id = ?, description = ? WHERE id = ?", (detail.master_id, detail.description, detail_id))
    conn.commit()
    conn.close()
    if cur.rowcount == 0:
        raise HTTPException(status_code=404, detail="Detail not found")
    return Detail(id=detail_id, master_id=detail.master_id, description=detail.description)

@app.delete("/details/{detail_id}")
def delete_detail(detail_id: int):
    conn = get_db_connection()
    cur = conn.execute("DELETE FROM detail WHERE id = ?", (detail_id,))
    conn.commit()
    conn.close()
    if cur.rowcount == 0:
        raise HTTPException(status_code=404, detail="Detail not found")
    return {"message": "Detail deleted"}

# To run the server, use: uvicorn main:app --reload