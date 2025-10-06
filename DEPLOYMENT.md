# Deployment Guide

## Development Server

To run the development server locally:

```bash
cd CanteenConviency
npm install
npm run dev
```

The application will be available at `http://localhost:3000`

## Production Build

To create a production build:

```bash
npm run build
```

This creates optimized files in the `dist` directory.

## Hosting Options

### 1. Static Hosting (Recommended)
The built application is a static site and can be deployed to:
- **Netlify**: Drag and drop the `dist` folder
- **Vercel**: Connect your Git repository for automatic deployments
- **GitHub Pages**: Upload the `dist` contents to your repository
- **Azure Static Web Apps**: Deploy directly from GitHub

### 2. Traditional Web Server
Upload the contents of the `dist` directory to any web server (Apache, Nginx, IIS).

### 3. Local Testing
To test the production build locally:
```bash
npm run preview
```

## Environment Configuration

The application uses CDN-loaded Tailwind CSS for simplicity. For production, consider:
1. Installing Tailwind CSS locally for better performance
2. Setting up proper environment variables
3. Configuring CSP headers for security

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions  
- Safari: Latest 2 versions
- IE: Not supported (uses modern JavaScript features)