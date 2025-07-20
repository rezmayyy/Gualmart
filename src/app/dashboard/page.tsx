'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

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

  // Fetch recent events
  useEffect(() => {
    if (!profile) return;
    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*, item:items(name,aisle)')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(10);
      if (!error) setRecentEvents(data || []);
    };
    fetchEvents();
  }, [profile, submitting]);

  // Fetch all events, items, and profiles for manager
  useEffect(() => {
    if (!profile || profile.role !== 'manager') return;
    const fetchAll = async () => {
      const [{ data: events, error: eventsError }, { data: items, error: itemsError }, { data: profiles, error: profilesError }] = await Promise.all([
        supabase.from('events').select('*').order('created_at', { ascending: false }).limit(25),
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
      }
    };
    fetchAll();
  }, [profile]);

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
        </div>
      </main>
    );
  }

  if (profile.role === 'manager') {
    return (
      <main className="max-w-4xl mx-auto py-10 px-4">
        <h1 className="text-2xl font-bold mb-4 text-[#0071ce]">Welcome, Manager {profile.name}!</h1>
        <p className="mb-6">View store trends, all events, and manage inventory.</p>
        <div className="border rounded p-6 bg-white shadow mb-8">
          <h2 className="text-lg font-bold mb-4">[Charts & Trends Placeholder]</h2>
          {/* TODO: Add charts/analytics here */}
        </div>
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
        </div>
      </main>
    );
  }

  return null;
} 