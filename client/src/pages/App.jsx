export default function App() {
  return (
    <div className="relative flex justify-center items-center w-screen h-screen overflow-hidden bg-[#0A1633] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_30%,rgba(59,130,246,0.22),transparent)]" />
      <div
        className="absolute inset-0 opacity-40
        [background-image:linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)]
        [background-size:36px_36px]"
      />
      <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-blue-600/20 blur-3xl" />
      <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent to-black/30" />
    </div>
  );
}
