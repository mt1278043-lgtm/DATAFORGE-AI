# DataForge AI

A professional, production-ready AI-powered data forge application built with modern web technologies.

## 🚀 Features

- **Real-time Data Processing**: Process and analyze data with high-performance infrastructure
- **AI-Powered Analytics**: Advanced machine learning algorithms for actionable insights
- **Secure & Scalable**: Enterprise-grade security with auto-scaling capabilities
- **Easy Integration**: Simple REST APIs and webhooks for seamless integration
- **Beautiful Dashboard**: Professional UI with real-time data visualization
- **TypeScript Support**: Full type safety across the stack
- **Production Ready**: Optimized for deployment on Vercel and other platforms

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Styling**: Tailwind CSS with custom components
- **Deployment**: Vercel (built-in optimization)
- **Package Manager**: npm

## 📋 Requirements

- Node.js 18.x or higher
- npm 9.x or higher

## 🏃 Getting Started

### Installation

```bash
# Clone the repository
git clone https://github.com/mt1278043-lgtm/dataforge-ai.git
cd dataforge-ai

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
```

### Development

```bash
# Run the development server
npm run dev

# Open http://localhost:3000 in your browser
```

### Production Build

```bash
# Build for production
npm run build

# Start the production server
npm start

# Run type checking
npm run type-check

# Run linting
npm run lint
```

## 📁 Project Structure

```
dataforge-ai/
├── app/
│   ├── api/              # API routes
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Home page
│   └── globals.css       # Global styles
├── components/           # Reusable React components
├── public/              # Static assets
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── tailwind.config.js   # Tailwind CSS configuration
├── next.config.js       # Next.js configuration
└── vercel.json          # Vercel deployment config
```

## 🔌 API Endpoints

### Health Check
```
GET /api/health
```

### Get Data
```
GET /api/data
```

### Create Data
```
POST /api/data
Content-Type: application/json

{
  "name": "Item Name",
  "value": 100,
  "status": "active"
}
```

## 🎨 Styling

The project uses Tailwind CSS with custom component classes defined in `app/globals.css`:

- `.btn` - Button base styles
- `.btn-primary` - Primary action button
- `.btn-secondary` - Secondary action button
- `.input` - Form input styles
- `.card` - Card component styles

## 📦 Dependencies

### Production
- react@18.3.1
- next@15.0.0
- typescript@5.3.3
- tailwindcss@3.4.1
- axios@1.6.2
- zustand@4.4.2

### Development
- @types/node@20.10.0
- @types/react@18.2.37
- eslint@8.55.0
- autoprefixer@10.4.16
- postcss@8.4.32

## 🚀 Deployment

### Deploy to Vercel

1. Push to GitHub
2. Connect your GitHub repository to Vercel
3. Vercel will automatically detect Next.js and configure the build

```bash
# Or deploy directly using Vercel CLI
npm install -g vercel
vercel
```

### Environment Variables

Set these in your deployment platform:

```
NEXT_PUBLIC_API_URL=https://your-domain.com
NODE_ENV=production
```

## 📊 Performance

- ✅ Optimized for Core Web Vitals
- ✅ Automatic code splitting
- ✅ Image optimization (next/image)
- ✅ Static site generation where possible
- ✅ Edge function ready

## 🔒 Security

- TypeScript for type safety
- ESLint for code quality
- Security headers configured
- Environment variable protection

## 📝 License

MIT License - feel free to use this project for your own purposes.

## 📧 Support

For support, email support@dataforge.ai or open an issue on GitHub.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Built with ❤️ using Next.js and Modern Web Technologies
