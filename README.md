# Konsiyer Enterprise

A modern Shopify store management dashboard built with React, Vite, and Tailwind CSS.

## Features

- 🏪 **Shopify Integration** - Connect and manage your Shopify store
- 🔐 **Firebase Authentication** - Secure login with email/password and Google
- 📊 **Analytics Dashboard** - View store statistics and product insights
- 🎨 **Modern UI** - Beautiful, responsive design with Tailwind CSS
- ⚡ **Fast Development** - Vite for lightning-fast dev server and builds

## Tech Stack

- **Frontend**: React 19, Vite 6
- **Styling**: Tailwind CSS 3 with custom components
- **Authentication**: Firebase Auth
- **Database**: Firestore
- **Icons**: Heroicons
- **Routing**: React Router DOM

## Getting Started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Start development server**

   ```bash
   npm run dev
   ```

3. **Build for production**
   ```bash
   npm run build
   ```

## Tailwind CSS Setup

This project uses Tailwind CSS for styling with:

- **PostCSS**: Processing CSS with `@tailwindcss/postcss`
- **Autoprefixer**: Automatic vendor prefixes
- **Custom Components**: Reusable button and card styles
- **Inter Font**: Modern typography
- **VS Code IntelliSense**: Auto-completion for Tailwind classes

### Custom Components Available

- `.btn-primary` - Primary button styling
- `.btn-secondary` - Secondary button styling
- `.card` - Card container with shadow and hover effects
- `.input-field` - Form input styling

## Project Structure

```
src/
├── components/          # React components
│   ├── Dashboard.jsx   # Main dashboard
│   ├── Login.jsx       # Authentication
│   └── LoadingSpinner.jsx
├── contexts/           # React contexts
├── services/           # API services
└── assets/            # Static assets
```

## Environment Variables

Create a `.env` file with your Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
```
