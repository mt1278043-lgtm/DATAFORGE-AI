const features = [
  {
    title: 'Real-time Processing',
    description: 'Process and analyze data in real-time with our high-performance infrastructure.',
    icon: '⚡',
  },
  {
    title: 'AI-Powered Analytics',
    description: 'Get actionable insights using advanced machine learning algorithms.',
    icon: '🤖',
  },
  {
    title: 'Secure & Scalable',
    description: 'Enterprise-grade security with auto-scaling capabilities.',
    icon: '🔒',
  },
  {
    title: 'Easy Integration',
    description: 'Simple APIs and webhooks for seamless integration.',
    icon: '🔗',
  },
  {
    title: 'Advanced Visualization',
    description: 'Beautiful dashboards and charts to visualize your data.',
    icon: '📊',
  },
  {
    title: '24/7 Support',
    description: 'Round-the-clock professional support and documentation.',
    icon: '💬',
  },
]

export default function Features() {
  return (
    <section id="features" className="bg-white py-20 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h3 className="text-3xl sm:text-4xl font-bold text-center mb-4 text-gray-900">
          Powerful Features
        </h3>
        <p className="text-center text-gray-600 mb-12 text-lg max-w-2xl mx-auto">
          Everything you need to succeed with your data
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="card">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h4 className="text-xl font-semibold mb-2 text-gray-900">
                {feature.title}
              </h4>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
