export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">DF</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              DataForge AI
            </h1>
          </div>
          <nav className="hidden md:flex gap-8">
            <a href="#features" className="text-gray-600 hover:text-indigo-600 transition">
              Features
            </a>
            <a href="#about" className="text-gray-600 hover:text-indigo-600 transition">
              About
            </a>
            <a href="#contact" className="text-gray-600 hover:text-indigo-600 transition">
              Contact
            </a>
          </nav>
        </div>
      </div>
    </header>
  )
}
