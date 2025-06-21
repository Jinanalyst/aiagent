# AI Code Builder - AI SaaS Platform

A Next.js-based AI SaaS platform for generating HTML, CSS, JavaScript, and React components using OpenAI's GPT API. Features Solana wallet integration for crypto payments and a credit-based system.

## Features

- 🤖 **AI Code Generation**: Generate HTML, CSS, JavaScript, and React components
- 💳 **Solana Wallet Integration**: Connect with Phantom wallet for payments
- 💰 **Credit System**: Free users get 10 credits, Pro/Premium get unlimited
- 📊 **Dashboard**: Track usage, credits, and generation history
- 🎨 **Modern UI**: Built with Tailwind CSS and shadcn/ui components
- 🔐 **User Management**: Supabase backend for user data and credit tracking
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **AI**: OpenAI GPT-4 API
- **Blockchain**: Solana (Phantom wallet)
- **Icons**: Lucide React

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── generate/      # AI code generation
│   │   └── credits/       # Credit management
│   ├── dashboard/         # User dashboard
│   ├── pricing/           # Pricing plans
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ai/               # AI-related components
│   ├── wallet/           # Solana wallet components
│   └── ui/               # shadcn/ui components
├── lib/                  # Utility libraries
│   ├── supabase/         # Supabase client
│   ├── solana/           # Solana configuration
│   └── utils.ts          # Utility functions
└── types/                # TypeScript type definitions
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- OpenAI API key
- Phantom wallet (for testing)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-chatgpt-business
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Fill in your environment variables:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   OPENAI_API_KEY=your_openai_api_key
   ```

4. **Set up Supabase Database**

   Create the following tables in your Supabase database:

   ```sql
   -- Users table
   CREATE TABLE users (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     wallet_address TEXT UNIQUE NOT NULL,
     email TEXT,
     credits INTEGER DEFAULT 10,
     plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'premium')),
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Credit transactions table
   CREATE TABLE credit_transactions (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id TEXT NOT NULL,
     type TEXT CHECK (type IN ('purchase', 'usage', 'refund')),
     amount INTEGER NOT NULL,
     description TEXT NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- AI generations table
   CREATE TABLE ai_generations (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id TEXT NOT NULL,
     prompt TEXT NOT NULL,
     output TEXT NOT NULL,
     type TEXT CHECK (type IN ('html', 'css', 'js', 'react')),
     credits_used INTEGER NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### For Users

1. **Connect Wallet**: Click "Connect Wallet" and connect your Phantom wallet
2. **Generate Code**: 
   - Select code type (HTML, CSS, JS, React)
   - Enter your prompt describing what you want to generate
   - Click "Generate Code"
3. **View Results**: Generated code appears in the output panel
4. **Copy/Download**: Use the copy or download buttons to save your code
5. **Check Credits**: View remaining credits in the top-right corner

### For Developers

#### Adding New Code Types

1. Update the `GenerationRequest` type in `src/types/index.ts`
2. Add credit usage in `src/lib/solana/wallet.ts`
3. Update the UI components to include the new type

#### Customizing AI Prompts

Modify the system prompt in `src/app/api/generate/route.ts` to change how the AI generates code.

#### Adding New Payment Methods

1. Create new wallet adapters in `src/components/wallet/WalletProvider.tsx`
2. Update payment logic in the pricing page
3. Add transaction handling for the new payment method

## API Endpoints

### POST /api/generate
Generate AI code based on user prompt.

**Request:**
```json
{
  "prompt": "Create a responsive navigation bar",
  "type": "html",
  "userId": "wallet_address"
}
```

**Response:**
```json
{
  "success": true,
  "output": "<nav>...</nav>",
  "creditsRemaining": 9
}
```

### GET /api/credits?walletAddress=...
Get user credit information.

### POST /api/credits
Update user credits or plan.

## Credit System

- **Free Plan**: 10 credits, basic features
- **Pro Plan**: Unlimited credits, all features (0.1 SOL)
- **Premium Plan**: Unlimited credits, advanced features (0.25 SOL)

### Credit Usage
- HTML/CSS: 1 credit
- JavaScript: 2 credits  
- React: 3 credits

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, please open an issue on GitHub or contact the development team.

## Roadmap

- [ ] Add more code generation types (Python, TypeScript, etc.)
- [ ] Implement real Solana transactions for payments
- [ ] Add team collaboration features
- [ ] Create API documentation
- [ ] Add code templates library
- [ ] Implement usage analytics
- [ ] Add export to various formats (PDF, ZIP, etc.)
