interface HeroProps {
  onGetStarted: () => void
}

export default function Hero({ onGetStarted }: HeroProps) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
      <div className="text-center">
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
          Transform Your Data with
          <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            {' '}AI Intelligence
          </span>
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Professional data processing and analysis powered by cutting-edge AI technology.
          Build, deploy, and scale with confidence.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onGetStarted}
            className="btn btn-primary text-lg px-8 py-3"
          >
            Get Started
          </button>
          <button className="btn btn-secondary text-lg px-8 py-3">
            Learn More
          </button>
        </div>
      </div>
    </section>
  )
}
