const API_BASE = "http://localhost:8000";

export async function getAllOrders() {
    const res = await fetch(`${API_BASE}/orders/`);
    if (!res.ok) throw new Error("Failed to fetch orders");
    return res.json();
}

export async function createOrder(order) {
    const res = await fetch(`${API_BASE}/orders/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order)
    });
    if (!res.ok) throw new Error("Failed to create order");
    return res.json();
}

export async function getOrder(orderId) {
    const res = await fetch(`${API_BASE}/orders/${orderId}/`);
    if (!res.ok) throw new Error("Order not found");
    return res.json();
}

export async function updateOrder(orderId, order) {
    const res = await fetch(`${API_BASE}/orders/${orderId}/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order)
    });
    if (!res.ok) throw new Error("Failed to update order");
    return res.json();
}

export async function deleteOrder(orderId) {
    const res = await fetch(`${API_BASE}/orders/${orderId}/`, {
        method: "DELETE"
    });
    if (!res.ok) throw new Error("Failed to delete order");
    return res.json();
}