# Seovileo - Photography SaaS Platform

Online photo galleries for photographers with newsletter management and AI-powered content generation.

## 🚀 Features

-   📸 **Photo Gallery Management** - Create and share beautiful galleries
-   🔒 **Password Protection** - Secure galleries with passwords
-   💾 **ZIP Downloads** - Easy bulk photo downloads
-   📧 **Newsletter System** - Built-in newsletter management
-   🤖 **AI Content Generation** - Generate newsletters with Groq AI
-   💳 **Subscription Management** - Lemon Squeezy integration
-   🎨 **Customizable Hero Templates** - Personalized gallery pages
-   🌐 **Custom Subdomains** - Professional gallery URLs

## 📝 Newsletter Features

### For Users

-   Subscribe/Unsubscribe functionality
-   Beautiful, responsive newsletter page
-   Email confirmation system
-   Privacy-focused (GDPR compliant)

### For Admins

-   Rich text editor with Markdown support
-   **AI-powered newsletter generation** with Groq
-   Live preview
-   Subscriber management
-   Bulk email sending
-   Automated scheduling (CRON)

## 🤖 AI Newsletter Generation

Generate professional newsletter content in seconds using Groq AI!

### Quick Setup:

1. Get free API key from [console.groq.com](https://console.groq.com)
2. Add to `.env`: `GROQ_API_KEY=your_key_here`
3. Use in admin panel: `/admin/newsletter`

[📖 Full AI Setup Guide](./docs/NEWSLETTER_AI_GENERATION.md)

## 🛠️ Tech Stack

-   **Framework**: Next.js 15 (App Router)
-   **Database**: Neon PostgreSQL
-   **Storage**: Cloudflare R2
-   **Styling**: Tailwind CSS
-   **UI Components**: shadcn/ui
-   **Email**: Gmail SMTP (Nodemailer)
-   **Payments**: Lemon Squeezy
-   **AI**: Groq API (Llama 3.3 70B)

## 📦 Installation

```bash
# Clone repository
git clone https://github.com/Nawija/saas-fot.git
cd saas-fot

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your credentials

# Run database migrations
node scripts/quick-neon-migrate.js database/migration_newsletter.sql

# Start development server
npm run dev
```

## 🔐 Environment Variables

Required variables (see `.env.example`):

```env
DATABASE_URL=              # Neon PostgreSQL
R2_ACCESS_KEY_ID=          # Cloudflare R2
R2_SECRET_ACCESS_KEY=      # Cloudflare R2
EMAIL_FROM=                # Gmail address
EMAIL_PASSWORD=            # Gmail app password
LEMON_SQUEEZY_API_KEY=     # Payment processor
GROQ_API_KEY=              # AI generation (optional)
```

## 📚 Documentation

-   [Newsletter AI Generation](./docs/NEWSLETTER_AI_GENERATION.md)
-   [Email Input Component](./components/ui/email-input.md)
-   [Newsletter System](./docs/MAILING_SYSTEM.md)
-   [Lemon Squeezy Setup](./docs/LEMON_SQUEEZY_SETUP.md)
-   [Subdomain System](./docs/SUBDOMAIN_SYSTEM.md)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this project for your own purposes.

## 🔗 Links

-   [Live Demo](https://seovileo.pl)
-   [Documentation](./docs/)
-   [Issues](https://github.com/Nawija/saas-fot/issues)

---

Made with ❤️ for photographers
