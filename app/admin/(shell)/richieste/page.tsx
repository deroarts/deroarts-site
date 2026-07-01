export const metadata = { title: "Richieste | Admin DeroArts" };

export default function RichiesteAdminPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-graphite mb-4">Richieste</h1>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center text-gray-400">
        <svg
          className="w-10 h-10 mx-auto mb-3 opacity-40"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
        <p className="font-medium">Sezione in arrivo nel Modulo 4</p>
        <p className="text-sm mt-1">
          Le richieste di informazioni saranno gestibili qui.
        </p>
      </div>
    </div>
  );
}
