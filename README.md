# 🏃‍♂️⏱️ Cross Country Timer

A sleek, modern web app for timing cross-country races! Built for coaches, volunteers, and race organizers who need a reliable, easy-to-use timing solution that works on any device.

## 🎯 What is this?

Ever been at a cross-country meet trying to juggle stopwatches, clipboards, and frantically scribbled times? This app turns your phone, tablet, or laptop into a professional timing system! Track multiple runners across different checkpoints, organize by teams, and share results instantly.

Perfect for:
- 🏫 School cross-country meets
- 🏃‍♀️ Local running clubs
- 🏆 Youth athletics competitions
- 📊 Training sessions with split times

## ✨ Features

### 🏃 Runner Setup
- **Team Management**: Create colorful teams with custom names and colors
- **Runner Registration**: Add runners with names, grades, and team assignments
- **Flexible Units**: Switch between kilometers (1K, 2K, 3K, 4K, 5K) and miles (1M, 2M, 3M, 3.1M)
- **Smart Validation**: Confirmation dialogs prevent accidental deletions

### ⏱️ Race Timing
- **Live Timer**: Precision timing with millisecond accuracy
- **Multi-Team Support**: Time multiple teams simultaneously
- **Checkpoint Tracking**: Record times at different race distances
- **One-Tap Recording**: Simply tap a runner's name to record their time
- **Race Organization**: Name your races for better organization
- **Undo Function**: Easily remove incorrect times and return runners to active timing

### 📤 Share & Export
- **Multiple Export Options**: 
  - 🔗 Native device sharing
  - 📱 QR codes for instant device-to-device transfer
  - 💾 JSON file downloads for backup
- **Flexible Sharing**: Share complete sessions, individual teams, specific checkpoints, or full races
- **Smart Filtering**: Choose exactly what data to share

### 📥 Import & Sync
- **QR Code Scanning**: Import data by scanning QR codes from other devices
- **File Upload**: Import from JSON backup files
- **Manual Import**: Paste JSON data directly
- **Smart Merging**: Choose how to handle imported data:
  - 🔄 Merge with existing data
  - 🎯 Selective import (choose specific teams/races)
  - ⚠️ Complete replacement

## 🚀 How to Use

### Getting Started
1. **Create Teams**: Start by setting up your teams with names and colors
2. **Add Runners**: Register runners with their names, grades, and team assignments
3. **Choose Your Units**: Select kilometers or miles based on your race format

### During the Race
1. **Set Up Timing**: 
   - Enter a race name (e.g., "State Championship")
   - Select which team(s) you're timing
   - Choose the checkpoint (1K, 2K, etc.)
2. **Start the Timer**: Hit the big green start button when the race begins
3. **Record Times**: As runners pass your checkpoint, simply tap their name to record their time
4. **Manage Results**: Use the undo button if you need to correct a time

### After the Race
1. **Share Results**: Use the Share tab to export your data
2. **Choose Your Format**: QR code for quick sharing, file download for backup, or native sharing
3. **Import from Others**: Collect data from other checkpoint volunteers using the Import tab

## 🛠️ Technical Overview

### Built With
- **Frontend Framework**: [Svelte](https://svelte.dev/) - Fast, reactive, and lightweight
- **Build Tool**: [Vite](https://vitejs.dev/) - Lightning-fast development and building
- **Language**: TypeScript - Type-safe JavaScript for better development experience
- **Styling**: Custom CSS with CSS variables for theming
- **PWA Support**: Service workers and manifest for offline functionality

### Key Libraries
- **QR Code Generation**: `qrcode` - Create QR codes for data sharing
- **QR Code Scanning**: `qr-scanner` - Camera-based QR code reading
- **State Management**: Svelte stores with localStorage persistence
- **Deployment**: GitHub Actions for automatic deployment to GitHub Pages

### Architecture
```
src/
├── lib/
│   ├── components/          # Svelte components for each screen
│   │   ├── RunnerSetup.svelte      # Team and runner management
│   │   ├── TimingScreen.svelte     # Live race timing interface
│   │   ├── ShareScreen.svelte      # Data export and sharing
│   │   ├── ImportScreen.svelte     # Data import and merging
│   │   └── Navigation.svelte       # App navigation
│   ├── stores/              # State management
│   │   └── session.ts              # Main app state and persistence
│   ├── types.ts             # TypeScript type definitions
│   └── utils/               # Utility functions
│       ├── sharing.ts              # QR codes and data export
│       ├── time.ts                 # Time formatting utilities
│       └── browser.ts              # Browser detection
├── App.svelte               # Main app component
├── main.ts                  # App entry point
└── app.css                  # Global styles and CSS variables
```

### Data Structure
The app uses a simple but flexible data model:
- **Teams**: ID, name, color
- **Runners**: ID, name, grade, team assignment
- **Times**: Runner ID, checkpoint, time, timestamp, race name
- **Session**: Contains all data plus metadata (units, current race, etc.)

## 🏗️ Development Setup

### Prerequisites
- Node.js 18 or higher
- npm or yarn package manager

### Installation
```bash
# Clone the repository
git clone https://github.com/yourusername/cross-country-timer.git
cd cross-country-timer

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts
```bash
npm run dev      # Start development server with hot reload
npm run build    # Build for production
npm run preview  # Preview production build locally
npm run check    # Run TypeScript and Svelte checks
npm run deploy   # Deploy to GitHub Pages (requires setup)
```

### Building for Production
```bash
npm run build
```
This creates a `dist/` folder with optimized, production-ready files.

### Deployment
The app is configured for automatic deployment to GitHub Pages:
1. Push to the `main` branch
2. GitHub Actions automatically builds and deploys
3. Your app will be available at `https://yourusername.github.io/cross-country-timer/`

## 🌟 Why This App?

**Simple**: No complex setup or accounts required - just open and start timing!

**Reliable**: Works offline once loaded, with data stored locally on your device.

**Flexible**: Handle any race format, team size, or checkpoint configuration.

**Shareable**: Instantly share results with coaches, parents, and other volunteers.

**Professional**: Clean, modern interface that works great on phones, tablets, and laptops.

## 🤝 Contributing

Found a bug? Have a feature idea? Contributions are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📱 Browser Support

Works on all modern browsers with:
- Camera access for QR code scanning
- Local storage for data persistence
- Service workers for offline functionality

Tested on:
- 📱 iOS Safari
- 🤖 Android Chrome
- 💻 Desktop Chrome, Firefox, Safari, Edge

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

**Happy Timing! 🏃‍♂️💨**

*Built with ❤️ for the cross-country community*