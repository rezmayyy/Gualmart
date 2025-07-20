import Image from "next/image";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4 font-sans">
      <h1 className="text-4xl font-bold mb-4 text-[#0071ce]">Welcome to Gualmart Shelf Tracker</h1>
      <p className="text-lg text-gray-700 max-w-xl mb-8">
        Easily log when shelves go empty or are restocked. Visualize trends and help your team keep the store running smoothly!
      </p>
      <div className="flex gap-6">
        <a href="/log" className="bg-[#0071ce] text-white px-6 py-3 rounded-lg font-semibold shadow hover:bg-[#005fa3] transition focus:outline-none focus:ring-2 focus:ring-[#0071ce]">Log Shelf Event</a>
        <a href="/dashboard" className="bg-white border border-[#0071ce] text-[#0071ce] px-6 py-3 rounded-lg font-semibold shadow hover:bg-blue-50 transition focus:outline-none focus:ring-2 focus:ring-[#0071ce]">View Dashboard</a>
      </div>
    </main>
  );
}
