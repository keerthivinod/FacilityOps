# FacilityOps PWA - Cross-Platform Installation Guide

FacilityOps is a Progressive Web App (PWA) that works seamlessly across all major platforms including Android, iOS, Windows, and macOS. This guide explains how to install and use the app on different devices.

## 🌟 PWA Features

### ✅ Core PWA Capabilities
- **Offline Support**: Access cached data and continue working offline
- **Background Sync**: Automatically sync data when back online
- **Push Notifications**: Receive facility updates and alerts
- **Installable**: Add to home screen like a native app
- **Fast Loading**: Optimized performance across all devices
- **Responsive Design**: Works perfectly on mobile, tablet, and desktop

### 📱 Platform-Specific Features
- **Android**: Full PWA support with install prompts
- **iOS**: Home screen installation with Safari
- **Windows**: Install as desktop app via Edge/Chrome
- **macOS**: Desktop app installation support

## 📋 Prerequisites

- Modern web browser (Chrome, Edge, Safari, Firefox)
- HTTPS connection (required for PWA features)
- JavaScript enabled

## 🚀 Installation Instructions

### Automatic Installation Prompts

FacilityOps uses **aggressive, multi-layered prompting** to ensure you get the install option:

#### 🔔 **Top Banner** (First-Time Visitors Only)
- **Appears immediately** when you first visit
- **Prominent banner** across the top of the page
- **"Install Now" button** for instant installation
- **Dismissible** but shows aggressive prompting afterward

#### 📱 **Bottom Modal Prompt** (After User Interaction)
- **Triggers on first interaction** (click, scroll, or touch)
- **Appears within 1.5 seconds** of page load
- **Browser-specific instructions** for your device
- **Visual guidance** with device-appropriate colors and icons

#### 🔘 **Floating Action Button** (Always Available)
- **Subtle install button** in bottom-right corner
- **Always visible** for manual triggering
- **Non-intrusive** but always accessible
- **Mobile-optimized** circular button with phone icon

### Prompt Timing & Behavior

| Browser Type | Top Banner | Modal Prompt | Fallback Prompt |
|-------------|------------|--------------|-----------------|
| **Chrome/Edge** | Immediate (1s) | On `beforeinstallprompt` | 1.5s timeout |
| **Samsung Internet** | Immediate (1s) | On interaction (2.5s) | 2s timeout |
| **iOS Safari** | Immediate (1s) | On interaction (3s) | 5s timeout |
| **Other Android** | Immediate (1s) | On interaction (2s) | 6s timeout |

**Smart Dismissal**: Prompts remember your preferences and won't show again if dismissed, but the floating button remains available.

#### 🔔 **Top Banner** (First Visit)
- A prominent banner appears at the top of the page immediately
- Click **"Install Now"** for instant installation

#### 📱 **Bottom Prompt** (After Interaction)
- Appears after you interact with the page (scroll, click, tap)
- Shows within 1.5-3 seconds of loading
- Includes browser-specific installation instructions

#### 🔘 **Floating Button** (Always Available)
- A subtle install button floats in the bottom-right corner
- Always visible for manual installation triggering

### Manual Installation (Browser-Specific)

#### Android Devices

##### Chrome Browser
1. An automatic install prompt will appear
2. Or tap the install icon (⬜➕) in the address bar
3. Click **"Install"** to add to home screen

##### Samsung Internet Browser
1. An automatic prompt will appear with specific instructions
2. Or tap the **menu button** (⋮) in the bottom-right corner
3. Select **"Add to Home screen"**
4. The app icon will appear on your home screen

#### Samsung Internet Browser
1. Open Samsung Internet browser
2. Navigate to the FacilityOps website
3. Tap the **menu button** (⋮) in the bottom-right corner
4. Select **"Add to Home screen"**
5. Tap **"Add"** to confirm
6. The app icon will appear on your home screen

### iOS Devices (iPhone/iPad)

1. Open **Safari** browser
2. Navigate to the FacilityOps website
3. Tap the **Share button** (⬆️) at the bottom
4. Scroll down and tap **"Add to Home Screen"**
5. Tap **"Add"** in the top-right corner
6. The FacilityOps icon will appear on your home screen

### Windows Desktop

#### Using Microsoft Edge
1. Open Edge and visit the FacilityOps website
2. Click the **app install icon** (📱) in the address bar
3. Click **"Install"** in the prompt
4. The app will install and appear in Start Menu

#### Using Google Chrome
1. Open Chrome and visit the website
2. Click the **install icon** (⬜➕) in the address bar
3. Click **"Install"** to add as desktop app

### macOS Desktop

#### Using Safari
1. Open Safari and visit the FacilityOps website
2. Click **"File"** → **"Add to Dock"** (or Share → Add to Dock)
3. The app will be added to your Dock

#### Using Chrome
1. Open Chrome and visit the website
2. Click the **install icon** in the address bar
3. Select **"Install FacilityOps"**
4. The app will appear in your Applications folder

## 🔧 Offline Usage

### What Works Offline
- **Cached Pages**: Previously visited pages load instantly
- **Facility Data**: View cached tickets, assets, and reports
- **Local Changes**: Make changes that sync when online
- **Navigation**: Browse cached content seamlessly

### Background Sync
- Changes made offline automatically sync when connection returns
- Data integrity maintained across sessions
- Conflict resolution for simultaneous edits

## 📢 Push Notifications

### Setup
1. Install the PWA on your device
2. Grant notification permissions when prompted
3. Receive real-time facility updates

### Notification Types
- **Critical Alerts**: Emergency tickets and safety issues
- **Maintenance Reminders**: Overdue tasks and AMC expirations
- **Status Updates**: Ticket resolutions and progress updates

## 🎯 App Shortcuts

Quick access to key features:
- **Dashboard**: Main overview and metrics
- **Tickets**: Active maintenance requests
- **AI Brain**: Intelligent facility analysis

## 🔄 Updates

The PWA updates automatically:
- New features download in the background
- No manual update process required
- Service worker handles seamless updates

## 🐛 Troubleshooting

### App Won't Install
- Ensure you're using a supported browser
- Check that JavaScript is enabled
- Try refreshing the page and attempting again

### Offline Features Not Working
- Clear browser cache and reinstall PWA
- Check service worker registration in DevTools
- Ensure stable internet connection for initial setup

### Notifications Not Appearing
- Check device notification settings
- Grant permissions in browser settings
- Reinstall the PWA if issues persist

## 🛠️ Technical Details

### Service Worker Features
- **Cache Strategy**: Network-first with cache fallback
- **Background Sync**: Queues offline changes for sync
- **Push Support**: Web Push API integration
- **Update Management**: Automatic version updates

### Browser Compatibility
- **Chrome/Edge**: Full PWA support with install prompts
- **Samsung Internet**: Full PWA support on Android devices
- **Safari**: iOS PWA support (limited features)
- **Firefox**: Basic PWA support
- **Other Android browsers**: Manual "Add to Home screen" support
- **Mobile Browsers**: Full support on modern versions

### Storage
- **IndexedDB**: Offline data storage
- **Cache API**: Static asset caching
- **LocalStorage**: App preferences and session data

## 📞 Support

For technical issues or questions:
- Check browser console for error messages
- Try reinstalling the PWA
- Contact facility IT support

---

**FacilityOps PWA** - Bringing facility management to your pocket, desktop, and everywhere in between! 🏗️📱💻