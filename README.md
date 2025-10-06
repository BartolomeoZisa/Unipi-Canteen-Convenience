# Canteen Convenience Calculator 🍽️

A modern web application to calculate the most convenient canteen tariff option based on ISEE (Indicatore della Situazione Economica Equivalente) and meal requirements for University of Pisa students.

## 🚀 Live Demo

The application is automatically deployed to GitHub Pages at:
**https://bartolomeozisa.github.io/Unipi-Canteen-Conveniency/**

## Features

- **Multi-language Support**: Available in English and Italian with easy language switching
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Intelligent Calculation**: Compares multiple tariff options to find the most cost-effective solution
- **Extensible Architecture**: Built following SOLID principles for easy maintenance and feature additions

## Tariff Options Supported

### 1. Per-Meal Pricing
- Based on ISEE ranges with different meal types (Complete, Reduced A/B/C)
- Special rates for ARDSU scholarship recipients (free meals)

### 2. Flat Tariffs
- 1 or 2 meals per day for 3 months
- Different pricing for users above/below €75,000 ISEE

### 3. Carnet Options
- Buy meals in bulk with free bonus meals
- 5+1 free, 10+2 free, 20+5 free options

## Technical Architecture

The application follows SOLID principles:

- **Single Responsibility**: Each class/component has one clear purpose
- **Open/Closed**: Easy to add new tariff options without modifying existing code
- **Liskov Substitution**: Interfaces ensure proper abstraction
- **Interface Segregation**: Clean separation of concerns
- **Dependency Inversion**: Services depend on abstractions, not concrete implementations

### Tech Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Internationalization**: react-i18next
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd CanteenConviency
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Usage

1. **Enter ISEE Value**: Input your economic indicator value in euros
2. **Specify Meals**: Enter the total number of meals needed
3. **Select Meal Type**: Choose your preferred meal type (Complete or Reduced options)
4. **Scholarship Status**: Check if eligible for ARDSU scholarship
5. **Calculate**: Click to see all available options with the recommended choice highlighted

## Configuration

### Adding New Languages

1. Create a new translation file in `src/locales/` (e.g., `fr.json`)
2. Add translations following the existing structure
3. Update `src/i18n.ts` to include the new language

### Adding New Tariff Options

1. **Per-meal pricing**: Update `ISEE_BRACKETS` in `src/services/tariffConfig.ts`
2. **Flat tariffs**: Add new entries to `FLAT_TARIFFS` array
3. **Carnet options**: Extend `CARNET_OPTIONS` array

### Modifying Calculation Logic

The calculation logic is centralized in `src/services/calculationService.ts`. The modular design allows for easy updates to pricing algorithms without affecting the UI.

## Project Structure

```
src/
├── components/           # React components
│   ├── TariffCalculatorForm.tsx
│   └── ResultsDisplay.tsx
├── services/            # Business logic
│   ├── calculationService.ts
│   └── tariffConfig.ts
├── types/               # TypeScript type definitions
│   └── index.ts
├── locales/             # Translation files
│   ├── en.json
│   └── it.json
├── i18n.ts              # Internationalization setup
├── App.tsx              # Main app component
└── main.tsx             # Application entry point
```

## 🚀 Deployment

The application is automatically deployed to GitHub Pages using GitHub Actions when changes are pushed to the `main` branch.

### Deployment Process
1. **Automatic Trigger**: Push to `main` branch triggers deployment
2. **Build & Test**: Runs tests and builds the application  
3. **Deploy**: Deploys to GitHub Pages automatically
4. **Live URL**: Available at https://bartolomeozisa.github.io/Unipi-Canteen-Conveniency/

### Manual Deployment
If you need to deploy manually:
```bash
# Build the application
npm run build

# The built files will be in the `dist` folder
# Deploy the contents of `dist` to your hosting service
```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm test` - Run test suite
- `npm test:watch` - Run tests in watch mode
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
- `npm run preview` - Preview production build

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -m 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Open a Pull Request

## Support

For support and questions, please open an issue in the GitHub repository.

---

**Made with ❤️ for University of Pisa students**