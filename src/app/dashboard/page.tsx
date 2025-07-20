'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LabelList } from 'recharts';
import { LineChart, Line } from 'recharts';

export default function Dashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [items, setItems] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [action, setAction] = useState('');
  const [count, setCount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [eventError, setEventError] = useState('');
  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  const [allEvents, setAllEvents] = useState<any[]>([]);
  const [allEventsForCharts, setAllEventsForCharts] = useState<any[]>([]);
  const [selectedTab, setSelectedTab] = useState('empty');
  const chartTabs = [
    { key: 'empty', label: 'Most Frequently Empty Items' },
    { key: 'restocked', label: 'Most Frequently Restocked Items' },
    { key: 'lowstock', label: 'Low Stock Frequency by Item' },
    { key: 'aisles', label: 'Busiest Aisles' },
    { key: 'time', label: 'Events Over Time' },
    { key: 'ratio', label: 'Restock vs Empty Ratio' },
  ];
  const allTabKeys = chartTabs.map(tab => tab.key);
  const [selectedTabs, setSelectedTabs] = useState<string[]>(['empty']);
  const [recentEventsPage, setRecentEventsPage] = useState(1);
  const EVENTS_PER_PAGE = 10;
  const [recentEventsTotal, setRecentEventsTotal] = useState(0);
  const [allEventsPage, setAllEventsPage] = useState(1);
  const ALL_EVENTS_PER_PAGE = 10;
  const [allEventsTotal, setAllEventsTotal] = useState(0);

  const handleTabClick = (key: string) => {
    if (key === 'all') {
      // Toggle all
      setSelectedTabs(selectedTabs.length === allTabKeys.length ? [] : allTabKeys);
    } else {
      setSelectedTabs(prev => {
        if (prev.includes(key)) {
          // Remove
          return prev.filter(k => k !== key);
        } else {
          // Add
          return [...prev, key];
        }
      });
    }
  };
  const router = useRouter();

  // Fetch profile
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/signin');
        return;
      }
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (error) {
        setError('Could not fetch profile.');
      } else {
        setProfile(data);
      }
      setLoading(false);
    };
    fetchProfile();
  }, [router]);

  // Fetch items
  useEffect(() => {
    if (!profile) return;
    const fetchItems = async () => {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .order('name');
      if (!error) setItems(data || []);
    };
    fetchItems();
  }, [profile]);

  // Fetch recent events with pagination
  useEffect(() => {
    if (!profile) return;
    const fetchEvents = async () => {
      const from = (recentEventsPage - 1) * EVENTS_PER_PAGE;
      const to = from + EVENTS_PER_PAGE - 1;
      const [{ data, error, count },] = await Promise.all([
        supabase
          .from('events')
          .select('*, item:items(name,aisle)', { count: 'exact' })
          .eq('user_id', profile.id)
          .order('created_at', { ascending: false })
          .range(from, to),
      ]);
      if (!error) {
        setRecentEvents(data || []);
        setRecentEventsTotal(count || 0);
      }
    };
    fetchEvents();
  }, [profile, submitting, recentEventsPage]);

  // Fetch all events, items, and profiles for manager with pagination (for table)
  useEffect(() => {
    if (!profile || profile.role !== 'manager') return;
    const fetchAll = async () => {
      const from = (allEventsPage - 1) * ALL_EVENTS_PER_PAGE;
      const to = from + ALL_EVENTS_PER_PAGE - 1;
      const [{ data: events, error: eventsError, count }, { data: items, error: itemsError }, { data: profiles, error: profilesError }] = await Promise.all([
        supabase.from('events').select('*', { count: 'exact' }).order('created_at', { ascending: false }).range(from, to),
        supabase.from('items').select('id, name, aisle'),
        supabase.from('profiles').select('id, name, role'),
      ]);
      if (!eventsError && !itemsError && !profilesError) {
        // Merge events with item and user info
        const merged = (events || []).map(ev => ({
          ...ev,
          item: items?.find(i => i.id === ev.item_id),
          user: profiles?.find(u => u.id === ev.user_id),
        }));
        setAllEvents(merged);
        setAllEventsTotal(count || 0);
      }
    };
    fetchAll();
  }, [profile, allEventsPage]);

  // Fetch all events, items, and profiles for manager (for charts)
  useEffect(() => {
    if (!profile || profile.role !== 'manager') return;
    const fetchAllForCharts = async () => {
      const [{ data: events, error: eventsError }, { data: items, error: itemsError }, { data: profiles, error: profilesError }] = await Promise.all([
        supabase.from('events').select('*').order('created_at', { ascending: false }),
        supabase.from('items').select('id, name, aisle'),
        supabase.from('profiles').select('id, name, role'),
      ]);
      if (!eventsError && !itemsError && !profilesError) {
        // Merge events with item and user info
        const merged = (events || []).map(ev => ({
          ...ev,
          item: items?.find(i => i.id === ev.item_id),
          user: profiles?.find(u => u.id === ev.user_id),
        }));
        setAllEventsForCharts(merged);
      }
    };
    fetchAllForCharts();
  }, [profile]);

  // Data transformation for charts should use allEventsForCharts
  const emptyCounts = allEventsForCharts
    .filter(ev => ev.action === 'empty' && ev.item)
    .reduce((acc, ev) => {
      const name = ev.item.name;
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  const emptyData = Object.entries(emptyCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => (b.count as number) - (a.count as number))
    .slice(0, 10); // Top 10

  // Data transformation for 'Most Frequently Restocked Items'
  const restockedCounts = allEventsForCharts
    .filter(ev => ev.action === 'restocked' && ev.item)
    .reduce((acc, ev) => {
      const name = ev.item.name;
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  const restockedData = Object.entries(restockedCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => (b.count as number) - (a.count as number))
    .slice(0, 10); // Top 10

  // Data transformation for 'Busiest Aisles'
  const aisleCounts = allEventsForCharts
    .filter(ev => ev.item)
    .reduce((acc, ev) => {
      const aisle = ev.item.aisle;
      acc[aisle] = (acc[aisle] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  const aisleData = Object.entries(aisleCounts)
    .map(([aisle, count]) => ({ aisle, count }))
    .sort((a, b) => (b.count as number) - (a.count as number))
    .slice(0, 10); // Top 10

  // Data transformation for 'Events Over Time' (by day)
  const eventsByDate = allEventsForCharts.reduce((acc, ev) => {
    const date = new Date(ev.created_at).toLocaleDateString();
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const eventsOverTimeData = Object.entries(eventsByDate)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Data transformation for 'Low Stock Frequency by Item'
  const lowStockCounts = allEventsForCharts
    .filter(ev => ev.action === 'low_stock' && ev.item)
    .reduce((acc, ev) => {
      const name = ev.item.name;
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  const lowStockData = Object.entries(lowStockCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => (b.count as number) - (a.count as number))
    .slice(0, 10); // Top 10

  // Data transformation for 'Restock vs Empty Ratio by Item'
  const restockEmptyCounts: Record<string, { restocked: number; empty: number }> = {};
  allEventsForCharts.forEach(ev => {
    if (!ev.item) return;
    const name = ev.item.name;
    if (!restockEmptyCounts[name]) restockEmptyCounts[name] = { restocked: 0, empty: 0 };
    if (ev.action === 'restocked') restockEmptyCounts[name].restocked += 1;
    if (ev.action === 'empty') restockEmptyCounts[name].empty += 1;
  });
  const restockEmptyData = Object.entries(restockEmptyCounts)
    .map(([name, counts]) => ({ name, ...counts }))
    .sort((a, b) => ((b.restocked + b.empty) - (a.restocked + a.empty)))
    .slice(0, 10); // Top 10 by total events

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setEventError('');
    if (!selectedItem || !action) {
      setEventError('Please select an item and action.');
      setSubmitting(false);
      return;
    }
    let countValue = count && !isNaN(Number(count)) ? parseInt(count) : undefined;
    const { error } = await supabase.from('events').insert({
      user_id: profile.id,
      item_id: selectedItem.id,
      action,
      count: countValue,
    });
    if (error) {
      setEventError('Failed to log event.');
    } else {
      setSelectedItem(null);
      setAction('');
      setCount('');
    }
    setSubmitting(false);
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-[60vh]">Loading dashboard...</div>;
  }
  if (error) {
    return <div className="text-red-600 text-center mt-8">{error}</div>;
  }
  if (!profile) {
    return null;
  }

  if (profile.role === 'associate') {
    return (
      <main className="max-w-2xl mx-auto py-10 px-4">
        <h1 className="text-2xl font-bold mb-4 text-[#0071ce]">Welcome, {profile.name}!</h1>
        <p className="mb-6">Log shelf events below and view your recent activity.</p>
        <form onSubmit={handleSubmit} className="border rounded p-6 bg-white shadow mb-8 flex flex-col gap-4">
          <div>
            <label className="block font-semibold mb-1">Item</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={selectedItem?.id || ''}
              onChange={e => {
                const item = items.find(i => i.id === e.target.value);
                setSelectedItem(item || null);
              }}
              required
            >
              <option value="">Select an item...</option>
              {items.map(item => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
            {selectedItem && (
              <div className="text-sm text-gray-600 mt-1">Aisle: {selectedItem.aisle} | Capacity: {selectedItem.capacity || 'N/A'}</div>
            )}
          </div>
          <div>
            <label className="block font-semibold mb-1">Action</label>
            <div className="flex gap-4">
              <button type="button" className={`px-4 py-2 rounded ${action==='empty'?'bg-[#0071ce] text-white':'bg-gray-100 text-gray-700'}`} onClick={() => setAction('empty')}>Empty</button>
              <button type="button" className={`px-4 py-2 rounded ${action==='low_stock'?'bg-[#0071ce] text-white':'bg-gray-100 text-gray-700'}`} onClick={() => setAction('low_stock')}>Low Stock</button>
              <button type="button" className={`px-4 py-2 rounded ${action==='restocked'?'bg-[#0071ce] text-white':'bg-gray-100 text-gray-700'}`} onClick={() => setAction('restocked')}>Restocked</button>
            </div>
          </div>
          {(action === 'low_stock' || action === 'restocked') && (
            <div>
              <label className="block font-semibold mb-1">Count</label>
              <input
                type="number"
                min="0"
                className="w-full border rounded px-3 py-2"
                value={count}
                onChange={e => setCount(e.target.value)}
                placeholder="Enter count..."
              />
            </div>
          )}
          {eventError && <div className="text-red-600 text-sm">{eventError}</div>}
          <button type="submit" disabled={submitting} className="bg-[#0071ce] text-white px-6 py-2 rounded font-semibold hover:bg-[#005fa3] transition disabled:opacity-50">
            {submitting ? 'Logging...' : 'Log Event'}
          </button>
        </form>
        <div className="border rounded p-6 bg-white shadow">
          <h2 className="text-lg font-bold mb-4">Your Recent Events</h2>
          {recentEvents.length === 0 && <div className="text-gray-500">No events yet.</div>}
          <ul className="space-y-2">
            {recentEvents.map(ev => (
              <li key={ev.id} className="border-b pb-2 last:border-b-0 flex flex-col sm:flex-row sm:justify-between sm:items-center">
                <span><span className="font-semibold">{ev.item?.name || 'Unknown Item'}</span> ({ev.item?.aisle || 'N/A'})</span>
                <span className="text-sm">{ev.action.replace('_', ' ')}{ev.count !== null && ev.count !== undefined ? ` (${ev.count})` : ''} &middot; {new Date(ev.created_at).toLocaleString()}</span>
              </li>
            ))}
          </ul>
          <div className="flex justify-between items-center mt-4">
            <button
              className="px-3 py-1 rounded bg-gray-100 text-gray-700 font-semibold disabled:opacity-50"
              onClick={() => setRecentEventsPage(p => Math.max(1, p - 1))}
              disabled={recentEventsPage === 1}
            >
              Previous
            </button>
            <span className="text-sm">Page {recentEventsPage} of {Math.max(1, Math.ceil(recentEventsTotal / EVENTS_PER_PAGE))}</span>
            <button
              className="px-3 py-1 rounded bg-gray-100 text-gray-700 font-semibold disabled:opacity-50"
              onClick={() => setRecentEventsPage(p => p + 1)}
              disabled={recentEventsPage * EVENTS_PER_PAGE >= recentEventsTotal}
            >
              Next
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (profile.role === 'manager') {
    return (
      <main className="max-w-4xl mx-auto py-10 px-4">
        <h1 className="text-2xl font-bold mb-4 text-[#0071ce]">Welcome, Manager {profile.name}!</h1>
        <p className="mb-6">View store trends, all events, and manage inventory.</p>
        {/* Chart Tabs */}
        <div className="mb-6 flex gap-2 flex-wrap sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-gray-200">
          <button
            key="all"
            onClick={() => handleTabClick('all')}
            className={`px-4 py-2 rounded-t font-semibold border-b-2 transition-colors ${selectedTabs.length === allTabKeys.length ? 'bg-[#0071ce] text-white border-[#0071ce]' : 'bg-gray-100 text-gray-700 border-transparent hover:bg-blue-50'}`}
          >
            All
          </button>
          {chartTabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => handleTabClick(tab.key)}
              className={`px-4 py-2 rounded-t font-semibold border-b-2 transition-colors ${selectedTabs.includes(tab.key) ? 'bg-[#0071ce] text-white border-[#0071ce]' : 'bg-gray-100 text-gray-700 border-transparent hover:bg-blue-50'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {/* Chart Content */}
        {selectedTabs.includes('empty') && (
          <div className="border rounded-b p-6 bg-white shadow mb-8">
            <h2 className="text-lg font-bold mb-4">Most Frequently Empty Items</h2>
            {emptyData.length === 0 ? (
              <div className="text-gray-500">No empty events yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={emptyData} layout="vertical" margin={{ left: 20, right: 20, top: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" allowDecimals={false} label={{ value: 'Times Empty', position: 'insideBottom', offset: -5 }} />
                  <YAxis type="category" dataKey="name" width={120} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#0071ce">
                    <LabelList dataKey="name" position="insideLeft" style={{ fill: 'white', fontWeight: 'bold' }} />
                    <LabelList dataKey="count" position="right" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        )}
        {selectedTabs.includes('restocked') && (
          <div className="border rounded-b p-6 bg-white shadow mb-8">
            <h2 className="text-lg font-bold mb-4">Most Frequently Restocked Items</h2>
            {restockedData.length === 0 ? (
              <div className="text-gray-500">No restocked events yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={restockedData} layout="vertical" margin={{ left: 20, right: 20, top: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" allowDecimals={false} label={{ value: 'Times Restocked', position: 'insideBottom', offset: -5 }} />
                  <YAxis type="category" dataKey="name" width={120} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#ffc220">
                    <LabelList dataKey="name" position="insideLeft" style={{ fill: 'white', fontWeight: 'bold' }} />
                    <LabelList dataKey="count" position="right" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        )}
        {selectedTabs.includes('lowstock') && (
          <div className="border rounded-b p-6 bg-white shadow mb-8">
            <h2 className="text-lg font-bold mb-4">Low Stock Frequency by Item</h2>
            {lowStockData.length === 0 ? (
              <div className="text-gray-500">No low stock events yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={lowStockData} layout="vertical" margin={{ left: 20, right: 20, top: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" allowDecimals={false} label={{ value: 'Low Stock Events', position: 'insideBottom', offset: -5 }} />
                  <YAxis type="category" dataKey="name" width={120} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#ff7043">
                    <LabelList dataKey="name" position="insideLeft" style={{ fill: 'white', fontWeight: 'bold' }} />
                    <LabelList dataKey="count" position="right" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        )}
        {selectedTabs.includes('aisles') && (
          <div className="border rounded-b p-6 bg-white shadow mb-8">
            <h2 className="text-lg font-bold mb-4">Busiest Aisles</h2>
            {aisleData.length === 0 ? (
              <div className="text-gray-500">No events yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={aisleData} layout="vertical" margin={{ left: 20, right: 20, top: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" allowDecimals={false} label={{ value: 'Events', position: 'insideBottom', offset: -5 }} />
                  <YAxis type="category" dataKey="aisle" width={120} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#0071ce">
                    <LabelList dataKey="name" position="insideLeft" style={{ fill: 'white', fontWeight: 'bold' }} />
                    <LabelList dataKey="count" position="right" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        )}
        {selectedTabs.includes('time') && (
          <div className="border rounded-b p-6 bg-white shadow mb-8">
            <h2 className="text-lg font-bold mb-4">Events Over Time</h2>
            {eventsOverTimeData.length === 0 ? (
              <div className="text-gray-500">No events yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={eventsOverTimeData} margin={{ left: 20, right: 20, top: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis allowDecimals={false} label={{ value: 'Events', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#0071ce" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        )}
        {selectedTabs.includes('ratio') && (
          <div className="border rounded-b p-6 bg-white shadow mb-8">
            <h2 className="text-lg font-bold mb-4">Restock vs Empty Ratio by Item</h2>
            {restockEmptyData.length === 0 ? (
              <div className="text-gray-500">No restock or empty events yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={restockEmptyData} layout="vertical" margin={{ left: 20, right: 20, top: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" allowDecimals={false} label={{ value: 'Events', position: 'insideBottom', offset: -5 }} />
                  <YAxis type="category" dataKey="name" width={120} />
                  <Tooltip />
                  <Bar dataKey="restocked" fill="#ffc220" name="Restocked">
                    <LabelList dataKey="name" position="insideLeft" style={{ fill: 'white', fontWeight: 'bold' }} />
                    <LabelList dataKey="restocked" position="right" />
                  </Bar>
                  <Bar dataKey="empty" fill="#0071ce" name="Empty">
                    <LabelList dataKey="empty" position="right" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        )}
        <div className="border rounded p-6 bg-white shadow">
          <h2 className="text-lg font-bold mb-4">Recent Events</h2>
          {allEvents.length === 0 && <div className="text-gray-500">No events yet.</div>}
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-2 py-1 text-left">Time</th>
                  <th className="px-2 py-1 text-left">Item</th>
                  <th className="px-2 py-1 text-left">Aisle</th>
                  <th className="px-2 py-1 text-left">Action</th>
                  <th className="px-2 py-1 text-left">Count</th>
                  <th className="px-2 py-1 text-left">User</th>
                </tr>
              </thead>
              <tbody>
                {allEvents.map(ev => (
                  <tr key={ev.id} className="border-b last:border-b-0">
                    <td className="px-2 py-1 whitespace-nowrap">{new Date(ev.created_at).toLocaleString()}</td>
                    <td className="px-2 py-1">{ev.item?.name || 'Unknown'}</td>
                    <td className="px-2 py-1">{ev.item?.aisle || 'N/A'}</td>
                    <td className="px-2 py-1 capitalize">{ev.action.replace('_', ' ')}</td>
                    <td className="px-2 py-1">{ev.count !== undefined && ev.count !== null ? ev.count : '-'}</td>
                    <td className="px-2 py-1">{ev.user?.name || 'Unknown'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-between items-center mt-4">
            <button
              className="px-3 py-1 rounded bg-gray-100 text-gray-700 font-semibold disabled:opacity-50"
              onClick={() => setAllEventsPage(p => Math.max(1, p - 1))}
              disabled={allEventsPage === 1}
            >
              Previous
            </button>
            <span className="text-sm">Page {allEventsPage} of {Math.max(1, Math.ceil(allEventsTotal / ALL_EVENTS_PER_PAGE))}</span>
            <button
              className="px-3 py-1 rounded bg-gray-100 text-gray-700 font-semibold disabled:opacity-50"
              onClick={() => setAllEventsPage(p => p + 1)}
              disabled={allEventsPage * ALL_EVENTS_PER_PAGE >= allEventsTotal}
            >
              Next
            </button>
          </div>
        </div>
      </main>
    );
  }

  return null;
} 