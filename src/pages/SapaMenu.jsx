import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  getVendors,
  getMenuItems,
  createFoodOrder,
  getMyFoodOrders,
  updateFoodOrderStatus,
} from '../services/api';
import { getSchoolTheme } from '../config/schools';

const ORDER_STATUS_STYLES = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  PREPARING: 'bg-purple-100 text-purple-800',
  READY: 'bg-green-100 text-green-800',
  COMPLETED: 'bg-gray-100 text-gray-600',
  CANCELLED: 'bg-red-100 text-red-600',
};

const asList = (res) => res.data.data || res.data.vendors || res.data.items || res.data.orders || [];

export default function SapaMenu() {
  const { user } = useAuth();
  const theme = getSchoolTheme(user?.school);

  const [tab, setTab] = useState('order');
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState({});
  const [pickupLocation, setPickupLocation] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadVendors = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getVendors();
      setVendors(asList(res));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load vendors');
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      const res = await getMyFoodOrders();
      setOrders(asList(res));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load orders');
    }
  };

  useEffect(() => {
    loadVendors();
    loadOrders();
  }, []);

  const openVendor = async (vendor) => {
    setSelectedVendor(vendor);
    setCart({});
    setNotice('');
    try {
      const res = await getMenuItems({ vendorId: vendor.id });
      setMenu(asList(res));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load menu');
    }
  };

  const cartItems = Object.entries(cart)
    .map(([menuItemId, quantity]) => {
      const item = menu.find((m) => m.id === menuItemId);
      return item ? { ...item, quantity } : null;
    })
    .filter(Boolean);

  const cartTotal = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const changeQty = (id, delta) => {
    setCart((prev) => {
      const next = { ...prev };
      const qty = (next[id] || 0) + delta;
      if (qty <= 0) delete next[id];
      else next[id] = qty;
      return next;
    });
  };

  const placeOrder = async () => {
    if (cartItems.length === 0) return;
    if (!pickupLocation.trim()) {
      setError('Enter where you want to pick up the food.');
      return;
    }

    setPlacing(true);
    setError('');
    setNotice('');

    try {
      await createFoodOrder({
        vendorId: selectedVendor.id,
        pickupLocation: pickupLocation.trim(),
        totalPrice: cartTotal,
        items: cartItems.map((i) => ({ menuItemId: i.id, quantity: i.quantity, price: i.price })),
      });
      setNotice('Order placed! The vendor will confirm shortly. Pay on pickup. 💵');
      setCart({});
      setPickupLocation('');
      setSelectedVendor(null);
      loadOrders();
      setTab('orders');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not place order');
    } finally {
      setPlacing(false);
    }
  };

  const cancelOrder = async (order) => {
    if (!window.confirm('Cancel this order?')) return;
    try {
      await updateFoodOrderStatus(order.id, 'CANCELLED');
      loadOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not cancel');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="mb-4">
        <Link to="/app" className="text-sm" style={{ color: theme.primary }}>← Back</Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-1">🍲 Sapa Menu</h1>
        <p className="text-sm text-gray-500">Good food, small money. Order from campus vendors.</p>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab('order')}
          className={`text-sm font-medium rounded-lg px-4 py-2 cursor-pointer ${
            tab === 'order' ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-700'
          }`}
        >
          Order Food
        </button>
        <button
          onClick={() => setTab('orders')}
          className={`text-sm font-medium rounded-lg px-4 py-2 cursor-pointer ${
            tab === 'orders' ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-700'
          }`}
        >
          My Orders ({orders.length})
        </button>
      </div>

      {error && <div className="bg-red-50 text-red-600 rounded-lg p-3 mb-4 text-sm">{error}</div>}
      {notice && <div className="bg-green-50 text-green-700 rounded-lg p-3 mb-4 text-sm">{notice}</div>}

      {tab === 'order' && !selectedVendor && (
        <>
          <h2 className="font-bold text-gray-900 mb-3">Vendors on your campus</h2>
          {loading && <p className="text-center text-gray-500 py-10">Loading...</p>}
          {!loading && vendors.length === 0 && (
            <p className="text-center text-gray-500 py-10 bg-white rounded-2xl border border-gray-100">
              No vendors on your campus yet. Check back soon.
            </p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {vendors.map((vendor) => (
              <button
                key={vendor.id}
                onClick={() => openVendor(vendor)}
                className="bg-white rounded-2xl border border-gray-100 p-5 text-left cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <h3 className="font-bold text-gray-900">{vendor.name}</h3>
                  {vendor.isOpen ? (
                    <span className="text-xs font-bold text-green-600">Open</span>
                  ) : (
                    <span className="text-xs font-bold text-gray-400">Closed</span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">📍 {vendor.location}</p>
                {vendor.description && (
                  <p className="text-sm text-gray-600 mt-2">{vendor.description}</p>
                )}
              </button>
            ))}
          </div>
        </>
      )}

      {tab === 'order' && selectedVendor && (
        <>
          <button
            onClick={() => setSelectedVendor(null)}
            className="text-sm mb-4 cursor-pointer"
            style={{ color: theme.primary }}
          >
            ← All vendors
          </button>
          <h2 className="font-bold text-gray-900 mb-3">{selectedVendor.name} — Menu</h2>

          {menu.length === 0 && (
            <p className="text-sm text-gray-500 bg-white rounded-2xl border border-gray-100 p-5">
              No menu items yet.
            </p>
          )}

          <div className="space-y-3 mb-6">
            {menu
              .filter((item) => item.isAvailable !== false)
              .map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4"
                >
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center text-2xl flex-shrink-0">
                      🍛
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-bold text-sm text-gray-900">{item.name}</h3>
                    {item.description && (
                      <p className="text-xs text-gray-500">{item.description}</p>
                    )}
                    <p className="text-sm font-bold mt-1" style={{ color: theme.primary }}>
                      ₦{item.price}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => changeQty(item.id, -1)}
                      className="w-7 h-7 rounded-full border border-gray-300 text-gray-600 cursor-pointer"
                    >
                      −
                    </button>
                    <span className="w-6 text-center text-sm font-medium">
                      {cart[item.id] || 0}
                    </span>
                    <button
                      onClick={() => changeQty(item.id, 1)}
                      className="w-7 h-7 rounded-full text-white cursor-pointer"
                      style={{ backgroundColor: theme.primary }}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
          </div>

          {cartItems.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky bottom-4 shadow-lg">
              <h3 className="font-bold text-gray-900 mb-2">Your Order</h3>
              <div className="space-y-1 text-sm text-gray-700 mb-3">
                {cartItems.map((i) => (
                  <div key={i.id} className="flex justify-between">
                    <span>{i.quantity}× {i.name}</span>
                    <span>₦{i.price * i.quantity}</span>
                  </div>
                ))}
                <div className="flex justify-between font-bold pt-2 border-t border-gray-100">
                  <span>Total</span>
                  <span>₦{cartTotal}</span>
                </div>
              </div>
              <input
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                placeholder="Pickup location (e.g. Queen Elizabeth Hall gate)"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-3 text-sm focus:outline-none focus:ring-2"
                style={{ ['--tw-ring-color']: theme.primary }}
              />
              <button
                onClick={placeOrder}
                disabled={placing}
                className="w-full text-white font-medium rounded-lg py-2 disabled:opacity-50 cursor-pointer"
                style={{ backgroundColor: theme.primary }}
              >
                {placing ? 'Placing order...' : `Place Order — ₦${cartTotal}`}
              </button>
              <p className="text-xs text-gray-400 mt-2 text-center">
                Pay on pickup. Sapa-friendly prices only. 🤝
              </p>
            </div>
          )}
        </>
      )}

      {tab === 'orders' && (
        <div className="space-y-3">
          {orders.length === 0 && (
            <p className="text-center text-gray-500 py-10 bg-white rounded-2xl border border-gray-100">
              No food orders yet. Your stomach deserves better.
            </p>
          )}
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold text-gray-900">
                    {order.vendor?.name || 'Vendor'}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    📍 Pickup: {order.pickupLocation || '—'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`text-xs font-bold rounded-full px-3 py-1 whitespace-nowrap ${
                      ORDER_STATUS_STYLES[order.status] || 'bg-gray-100'
                    }`}
                  >
                    {order.status}
                  </span>
                  <p className="text-sm font-bold mt-2">₦{order.totalPrice}</p>
                </div>
              </div>

              {order.items && order.items.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100 text-sm text-gray-600 space-y-1">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between">
                      <span>
                        {item.quantity}× {item.menuItem?.name || 'Item'}
                      </span>
                      <span>₦{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
              )}

              {order.status === 'PENDING' && (
                <button
                  onClick={() => cancelOrder(order)}
                  className="mt-3 text-xs border border-red-300 text-red-600 rounded-lg px-3 py-1.5 cursor-pointer"
                >
                  Cancel Order
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}