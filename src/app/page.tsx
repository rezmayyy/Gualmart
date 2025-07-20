import Image from "next/image";

export default function Home() {
  return (
    <main className="font-sans bg-gradient-to-br from-blue-50 to-white min-h-screen">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 pt-16 pb-10">
        <div className="max-w-3xl w-full bg-white/90 rounded-2xl shadow-xl p-10 flex flex-col items-center">
          <span className="inline-block bg-[#0071ce] rounded-full p-4 mb-6 shadow-lg">
            <svg width="48" height="48" fill="none" viewBox="0 0 24 24"><path fill="#fff" d="M12 2a1 1 0 0 1 1 1v1.07A7.002 7.002 0 0 1 19.93 11H21a1 1 0 1 1 0 2h-1.07A7.002 7.002 0 0 1 13 19.93V21a1 1 0 1 1-2 0v-1.07A7.002 7.002 0 0 1 4.07 13H3a1 1 0 1 1 0-2h1.07A7.002 7.002 0 0 1 11 4.07V3a1 1 0 0 1 1-1Zm0 4a5 5 0 1 0 0 10A5 5 0 0 0 12 6Z"/></svg>
          </span>
          <h1 className="text-5xl font-extrabold mb-4 text-[#0071ce] tracking-tight" style={{ fontFamily: 'Montserrat, sans-serif' }}>Gualmart Shelf Tracker</h1>
          <p className="text-xl text-gray-700 max-w-2xl mb-8" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            The easiest way for associates to log shelf status and for managers to visualize trends. Keep your store running smoothly with real-time insights.
          </p>
          <div className="flex gap-6 justify-center">
            <a href="/signup" className="bg-[#0071ce] text-white px-8 py-3 rounded-lg font-bold shadow hover:bg-[#005fa3] transition focus:outline-none focus:ring-2 focus:ring-[#0071ce] text-lg" style={{ fontFamily: 'Montserrat, sans-serif' }}>Get Started</a>
            <a href="/dashboard" className="bg-white border border-[#0071ce] text-[#0071ce] px-8 py-3 rounded-lg font-bold shadow hover:bg-blue-50 transition focus:outline-none focus:ring-2 focus:ring-[#0071ce] text-lg" style={{ fontFamily: 'Montserrat, sans-serif' }}>View Dashboard</a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-5xl mx-auto py-12 px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
          <svg width="36" height="36" fill="none" viewBox="0 0 24 24" className="mb-3"><path fill="#0071ce" d="M5 3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H5Zm0 2h14v14H5V5Zm2 3v2h10V8H7Zm0 4v2h7v-2H7Z"/></svg>
          <h3 className="font-bold text-lg mb-2 text-[#0071ce]">Fast Shelf Logging</h3>
          <p className="text-gray-600">Associates can quickly log when shelves are empty, low, or restocked—no barcode scanner required.</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
          <svg width="36" height="36" fill="none" viewBox="0 0 24 24" className="mb-3"><path fill="#0071ce" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 15h-2v-2h2v2Zm0-4h-2V7h2v6Z"/></svg>
          <h3 className="font-bold text-lg mb-2 text-[#0071ce]">Real-Time Insights</h3>
          <p className="text-gray-600">Managers get instant dashboards with trends, busiest aisles, and restock frequency—no spreadsheets needed.</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
          <svg width="36" height="36" fill="none" viewBox="0 0 24 24" className="mb-3"><path fill="#0071ce" d="M17 3a1 1 0 0 1 1 1v2h-2V4a1 1 0 0 1 1-1ZM7 3a1 1 0 0 1 1 1v2H6V4a1 1 0 0 1 1-1Zm10 16a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0v-2h2Zm-10 0a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0v-2h2Zm-4-6a1 1 0 0 1 1-1h2v2H4a1 1 0 0 1-1-1Zm16 0a1 1 0 0 1 1-1h2a1 1 0 1 1 0 2h-2v-2ZM12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8Z"/></svg>
          <h3 className="font-bold text-lg mb-2 text-[#0071ce]">Easy Setup</h3>
          <p className="text-gray-600">No hardware, no IT headaches. Just sign up, add your team, and start tracking in minutes.</p>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-4xl mx-auto py-12 px-4">
        <h2 className="text-2xl font-bold text-[#0071ce] mb-6 text-center" style={{ fontFamily: 'Montserrat, sans-serif' }}>How It Works</h2>
        <ol className="space-y-6 text-left mx-auto max-w-2xl list-decimal list-inside text-lg" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          <li><span className="font-bold text-[#0071ce]">Sign Up:</span> Create your account as an associate or manager.</li>
          <li><span className="font-bold text-[#0071ce]">Log Shelf Events:</span> Associates log shelf status with a few clicks—no scanning required.</li>
          <li><span className="font-bold text-[#0071ce]">See Trends:</span> Managers view real-time dashboards to spot problems and plan restocks.</li>
        </ol>
      </section>

      {/* Call to Action Section */}
      <section className="py-12 bg-[#0071ce] text-white text-center">
        <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>Ready to make shelf tracking easy?</h2>
        <a href="/signup" className="inline-block bg-white text-[#0071ce] px-8 py-3 rounded-lg font-bold shadow hover:bg-blue-50 transition focus:outline-none focus:ring-2 focus:ring-white text-lg" style={{ fontFamily: 'Montserrat, sans-serif' }}>Get Started Now</a>
      </section>

      {/* Footer */}
      <footer className="py-6 text-center text-gray-500 text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>
        &copy; {new Date().getFullYear()} Gualmart Shelf Tracker. Built with Next.js, Supabase, and Recharts.
      </footer>
    </main>
  );
}
