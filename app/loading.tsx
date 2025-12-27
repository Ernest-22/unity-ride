export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F2F2F7]">
      {/* Logo */}
      <div className="w-24 h-24 mb-6 animate-pulse">
        <img src="/logo.png" alt="Loading..." className="w-full h-full object-contain" />
      </div>
      
      {/* The 4 Dots Animation from your design */}
      <div className="flex space-x-2">
        <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-3 h-3 bg-pink-400 rounded-full animate-bounce"></div>
        <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
      </div>
    </div>
  );
}