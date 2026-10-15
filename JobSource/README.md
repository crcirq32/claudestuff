# JobSource - Gig Economy Aggregator App

A React Native iOS/Android application that aggregates gig economy platforms into a single dashboard.

## 📱 Overview

**JobSource** allows gig workers to:
- Browse jobs from multiple platforms (Instacart, DoorDash, UberEats, Rover, Wyzant, TaskRabbit, Handy, Thumbtack Pro)
- View distance, estimated pay, and job details
- Accept and manage duties from one place
- Track earnings across all platforms
- First account linking is FREE, additional accounts cost $0.99
- Browse jobs by ZIP code without creating an account

---

## 🎨 Design

**Color Scheme:** Lavender & Green
- Primary: #B57EDC (Lavender)
- Secondary: #4CAF50 (Green)
- Background: Light lavender palette
- Accent: Gold highlights for earnings

---

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ (LTS recommended)
- Xcode 14+ (for iOS)
- Android Studio (for Android)
- CocoaPods (iOS dependency management)
- Watchman (file watching)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd JobSource

# Install dependencies
npm install

# Install iOS dependencies
cd ios && pod install && cd ..

# Start Metro bundler
npx react-native start

# Run on iOS (separate terminal)
npx react-native run-ios

# Run on Android (separate terminal)
npx react-native run-android
```

---

## 📦 Project Structure

```
JobSource/
├── App.js                    # Main app entry
├── package.json              # Dependencies
├── android/                  # Android-specific files
├── ios/                      # iOS-specific files
└── src/
    ├── screens/              # All screen components
    ├── navigation/           # Navigation setup
    ├── context/              # React Context (state management)
    ├── theme/                # Colors, spacing, shadows
    ├── components/           # Reusable components
    ├── services/             # API services
    └── utils/                # Helper functions
```

---

## 💰 Pricing Model

| Feature | Cost |
|---------|------|
| First account linking | FREE |
| Each additional account | $0.99 USD |
| Browse by ZIP code | FREE (no account needed) |
| Basic dashboard | FREE |

**Revenue Sharing:**
- 30% to Apple (App Store fee)
- 50% of remaining to JobSource
- 50% of remaining to partnered platform

---

## 🏪 App Store Publishing Guide

### Step 1: Apple Developer Account

**Cost:** $99/year

1. Visit [developer.apple.com](https://developer.apple.com)
2. Click "Account" → "Join the Apple Developer Program"
3. Complete enrollment ($99 fee)
4. Wait 24-48 hours for approval

### Step 2: Prepare App for Submission

#### App Icons

Generate icons for all required sizes:

```bash
# Install icon generator
npm install -g rn-icon-generator

# Or create manually:
# Required sizes:
# - 20pt (40x40, 60x60)
# - 29pt (58x58, 87x87)
# - 40pt (80x80, 120x120)
# - 60pt (120x120, 180x180)
# - 1024x1024 (App Store)
```

Place icons in `ios/JobSource/Images.xcassets/AppIcon.appiconset/`

#### App Store Screenshots

**Required sizes:**
- iPhone 6.5" Display: 1242 x 2688 pixels
- iPhone 5.5" Display: 1242 x 2208 pixels
- iPad Pro (3rd Gen): 2048 x 2732 pixels

**Tools:**
- Use iOS Simulator → Device → Screenshot
- Or use Fastlane Snapshot

### Step 3: Configure App in App Store Connect

1. Visit [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
2. Click "My Apps" → "+" → "New App"
3. Fill details:
   - **Name:** JobSource
   - **Bundle ID:** com.yourcompany.jobsource
   - **SKU:** JOBSOURCE001
   - **User Access:** Full Access

### Step 4: App Information

**Required fields:**

| Field | Value |
|-------|-------|
| App Name | JobSource |
| Subtitle | All your gig work, one app |
| Category | Business |
| Content Rights | You own all content |
| Age Rating | 17+ (requires background checks) |

**Screenshots:**
- Upload 3-5 screenshots per device size
- Include captions

**Description:**
```
JobSource aggregates all your gig economy platforms into one powerful dashboard.

Browse jobs from Instacart, DoorDash, UberEats, Rover, Wyzant, TaskRabbit, Handy, and Thumbtack Pro—all in one place.

KEY FEATURES:
• Browse available gigs by ZIP code (no signup required)
• View estimated pay, distance, and job details
• Link your gig economy accounts (first one FREE)
• Track earnings across all platforms
• See jobs on an interactive map
• Accept and manage duties from one dashboard

PRICING:
• First account linking: FREE
• Additional accounts: $0.99 each
• Browse and search: FREE

SUPPORTED PLATFORMS:
• Instacart - Grocery shopping and delivery
• DoorDash - Restaurant food delivery
• Uber Eats - Food and grocery delivery
• Rover - Dog walking and pet sitting
• Wyzant - Tutoring and teaching
• TaskRabbit - Tasks and handyman work
• Handy - Home cleaning and services
• Thumbtack Pro - Professional services

Download JobSource today and take control of your gig work!

Privacy Policy: https://jobsource.app/privacy
Terms of Service: https://jobsource.app/terms
```

### Step 5: Configure In-App Purchases

Since we charge $0.99 for additional account linking:

1. In App Store Connect → Your App → "Features" → "In-App Purchases"
2. Click "+" → "Create New"
3. Configure:
   - **Reference Name:** Additional Account
   - **Product ID:** com.jobsource.additional_account
   - **Type:** Consumable
   - **Price Tier:** Tier 1 ($0.99)
   - **Display Name:** Additional Account
   - **Description:** Unlock access to another gig platform

4. Add screenshot of the purchase screen
5. Submit for review

### Step 6: Build for Release

```bash
# Open Xcode
open ios/JobSource.xcworkspace

# Select "Any iOS Device" as target
# Product → Archive

# Or use command line:
cd ios
xcodebuild -workspace JobSource.xcworkspace -scheme JobSource -configuration Release archive -archivePath build/JobSource.xcarchive
```

### Step 7: Upload to App Store

**Option A: Xcode Organizer**
1. Window → Organizer
2. Select your archive
3. Click "Distribute App"
4. Select "App Store Connect" → "Upload"

**Option B: Transporter App**
1. Download [Transporter](https://apps.apple.com/us/app/transporter/id1450874784) from Mac App Store
2. Drag your .ipa file to Transporter
3. Click "Deliver"

**Option C: Fastlane**
```bash
# Install Fastlane
sudo gem install fastlane

# Navigate to iOS folder
cd ios

# Create Fastfile
fastlane init

# Deploy
fastlane beta    # TestFlight
fastlane release # App Store
```

### Step 8: Submit for Review

1. In App Store Connect, select your build
2. Complete:
   - App Review Information (contact info)
   - App Review Notes (explain app functionality)
   - Attach demo video if needed
3. Click "Submit for Review"

**Review Timeline:** 24-48 hours (can be longer for first submission)

---

## 🤖 Android Port Guide

### Step 1: Install Android Studio

Download from [developer.android.com/studio](https://developer.android.com/studio)

### Step 2: Configure Android Project

```bash
# Already done via React Native, but verify:
cd android

# Make gradlew executable
chmod +x gradlew

# Build debug APK
./gradlew assembleDebug

# Build release APK
./gradlew assembleRelease
```

### Step 3: Generate Signing Key

```bash
# Create keystore
keytool -genkey -v -keystore jobsource.keystore -alias jobsource -keyalg RSA -keysize 2048 -validity 10000

# Place in android/app/
mkdir -p android/app/keystores
mv jobsource.keystore android/app/keystores/
```

### Step 4: Configure Signing

Create `android/keystores/release.keystore.properties`:

```
storeFile=keystores/jobsource.keystore
storePassword=YOUR_STORE_PASSWORD
keyAlias=jobsource
keyPassword=YOUR_KEY_PASSWORD
```

### Step 5: Update Gradle

In `android/app/build.gradle`:

```gradle
android {
    ...
    signingConfigs {
        release {
            if (project.hasProperty('MYAPP_RELEASE_STORE_FILE')) {
                storeFile file(MYAPP_RELEASE_STORE_FILE)
                storePassword MYAPP_RELEASE_STORE_PASSWORD
                keyAlias MYAPP_RELEASE_KEY_ALIAS
                keyPassword MYAPP_RELEASE_KEY_PASSWORD
            }
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled enableProguardInReleaseBuilds
            proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"
        }
    }
}
```

### Step 6: Build Release APK

```bash
cd android
./gradlew assembleRelease

# Output: android/app/build/outputs/apk/release/app-release.apk
```

### Step 7: Google Play Console

**Cost:** $25 one-time fee

1. Visit [play.google.com/console](https://play.google.com/console)
2. Pay $25 developer fee
3. Create app:
   - **App Name:** JobSource
   - **Default Language:** English
   - **App Category:** Business

### Step 8: Configure Store Listing

**Required assets:**
- App icon: 512 x 512 PNG
- Feature graphic: 1024 x 500 PNG
- 2-8 phone screenshots: 1080 x 1920 or 1080 x 2160
- 7-inch tablet screenshots (optional)
- 10-inch tablet screenshots (optional)

**Store listing text:**
- Short description (80 chars): "All your gig work, one app"
- Full description (4000 chars max)

### Step 9: In-App Products (Android)

1. Play Console → Your App → "Monetize" → "In-app products"
2. Create product:
   - **Product ID:** additional_account
   - **Type:** Consumable
   - **Price:** $0.99 USD

### Step 10: Upload APK/AAB

```bash
# Build App Bundle (preferred)
cd android
./gradlew bundleRelease

# Output: android/app/build/outputs/bundle/release/app-release.aab
```

Upload the .aab file to Google Play Console.

### Step 11: Publish

1. Complete content rating questionnaire
2. Set up pricing & distribution
3. Review and roll out to production

**Review Timeline:** 3-7 days

---

## 🔌 API Integration Guide

### Overview

To get real job data, you need API access from each platform. Here's how to request access:

### Instacart Shopper API

**Status:** Not publicly available
**Alternative:** Web scraping (check terms of service)

**Contact:**
- Email: shopper-support@instacart.com
- Subject: "API Access Request for Third-Party App"

**Email Template:**
```
Subject: API Access Request for Shopper Dashboard Integration

Dear Instacart Team,

We are developing JobSource, a gig economy aggregator app that helps shoppers find and manage opportunities across multiple platforms.

We would like to request API access to:
- View available batches in a shopper's zone
- Display batch details (earnings, items, distance)
- Track completion status

Our app currently has X active users and growing. We believe this integration would benefit Instacart shoppers by providing a unified dashboard.

We are committed to:
- Following Instacart's Terms of Service
- Protecting shopper data
- Displaying accurate, real-time information
- Driving more shopper engagement to your platform

Please let us know what API access options are available for developers.

Best regards,
[Your Name]
[Your Title]
[Contact Information]
[Company Name]
```

### DoorDash API

**Status:** Limited availability (Dasher API not public)
**Documentation:** [developer.doordash.com](https://developer.doordash.com)

**Note:** DoorDash primarily offers:
- Drive API (for delivery businesses)
- Store API (for restaurants)
- Not Dasher/shopper API

**Workaround:**
- Consider partnership approach
- Check for Dasher affiliate programs

### Uber API

**Status:** Available
**Documentation:** [developer.uber.com](https://developer.uber.com)

**Request Access:**
1. Create Uber Developer account
2. Create new app
3. Request specific scopes
4. Submit for review

**Available APIs:**
- Uber Rides API (for riders)
- Uber Eats API (limited restaurant access)
- Note: Driver/dasher APIs not public

### Rover API

**Status:** Not publicly documented
**Contact:** developers@rover.com

### TaskRabbit API

**Status:** Not available publicly
**Contact:** support@taskrabbit.com

### General Strategy

Since most gig platforms don't offer public APIs for workers, here are alternatives:

#### Option 1: Screen Scraping (with user consent)

```javascript
// Use WebView with user login
import { WebView } from 'react-native-webview';

function ServiceWebView({ serviceUrl }) {
  return (
    <WebView
      source={{ uri: serviceUrl }}
      onMessage={(event) => {
        // Parse job data from page
        const data = JSON.parse(event.nativeEvent.data);
        // Store in your backend
      }}
    />
  );
}
```

**Important:** Check each platform's Terms of Service before scraping.

#### Option 2: Partnership Approach

**Steps:**
1. Build MVP with mock data
2. Get user traction (1000+ users)
3. Approach platforms as valuable partner
4. Negotiate official API access or affiliate partnership
5. Offer revenue share from your in-app purchases

#### Option 3: Browser Extension + Mobile App

**Architecture:**
```
Browser Extension (on laptop):
  ↓ Scrapes job data from platform websites
  ↓ Sends to your backend API

Mobile App:
  ↓ Displays aggregated data
  ↓ Allows job acceptance
  ↓ Tracks completion
```

#### Option 4: OAuth + Official Apps

Have users:
1. Link account via OAuth
2. Use platform's official mobile app
3. Your app acts as "dashboard only"
4. Redirect to official apps for actions

### Sample API Architecture

```javascript
// src/services/api.js

class JobSourceAPI {
  constructor() {
    this.baseURL = 'https://api.jobsource.app/v1';
  }

  // Get jobs from all linked accounts
  async getJobs(location) {
    const response = await fetch(`${this.baseURL}/jobs?lat=${location.lat}&lng=${location.lng}`, {
      headers: {
        'Authorization': `Bearer ${await this.getToken()}`,
      },
    });
    return response.json();
  }

  // Accept a job
  async acceptJob(jobId, serviceId) {
    const response = await fetch(`${this.baseURL}/jobs/${jobId}/accept`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${await this.getToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ serviceId }),
    });
    return response.json();
  }

  // Get earnings summary
  async getEarnings(period = 'week') {
    const response = await fetch(`${this.baseURL}/earnings?period=${period}`, {
      headers: {
        'Authorization': `Bearer ${await this.getToken()}`,
      },
    });
    return response.json();
  }
}

export default new JobSourceAPI();
```

### Backend Requirements

You'll need a backend server to:
- Aggregate data from multiple sources
- Handle user authentication
- Process in-app purchases
- Cache job data
- Handle rate limiting

**Tech Stack Options:**
- Node.js + Express + MongoDB
- Python + FastAPI + PostgreSQL
- Firebase (Firestore + Functions)
- AWS Lambda + DynamoDB

---

## 🔐 Security Considerations

### Data Protection

```javascript
// Use encrypted storage for tokens
import * as SecureStore from 'expo-secure-store';

async function saveToken(token) {
  await SecureStore.setItemAsync('auth_token', token);
}

async function getToken() {
  return await SecureStore.getItemAsync('auth_token');
}
```

### Privacy Compliance

**Required policies:**
- Privacy Policy (hosted on your website)
- Terms of Service
- Data handling disclosures

**iOS Privacy Manifest:**
Add `PrivacyInfo.xcprivacy` to your iOS project with:
- Data collection disclosures
- Required reason API usage

---

## 📊 Analytics & Tracking

### Recommended Tools

1. **Firebase Analytics** (free)
   ```bash
   npm install @react-native-firebase/app @react-native-firebase/analytics
   ```

2. **Mixpanel** (paid, but powerful)
   ```bash
   npm install mixpanel-react-native
   ```

### Key Metrics to Track

- User acquisition (installs)
- Account linking conversion rate
- In-app purchase conversion
- Job acceptance rate
- Daily/weekly active users
- Retention rate (D1, D7, D30)

---

## 💵 Monetization Strategy

### Current Model: $0.99 per additional account

**Revenue Calculation:**

```
Example scenario:
- 1,000 users
- Each user links 3 accounts on average (1 free + 2 paid)
- Revenue: 1,000 × 2 × $0.99 = $1,980

After Apple 30% fee:
- Net: $1,980 × 0.70 = $1,386

After platform revenue share (50% to partners):
- Keep: $1,386 × 0.50 = $693

Plus additional revenue streams:
- Premium features: $4.99/month
- Priority job alerts: $2.99/month
- Analytics dashboard: $9.99/month
```

### Alternative Revenue Models

1. **Subscription (Recommended)**
   - Free: 1 account, basic features
   - Pro ($4.99/month): Unlimited accounts, analytics, priority alerts
   - Business ($9.99/month): Team management, advanced reporting

2. **Affiliate Commissions**
   - Get referral bonuses when users sign up for new platforms
   - $25-100 per new driver signup

3. **Featured Placement**
   - Platforms pay to have their jobs highlighted

---

## 🧪 Testing

### Unit Tests

```bash
npm test
```

### E2E Tests (Detox)

```bash
# Install Detox
npm install --save-dev detox

# Configure (follow Detox docs)
detox init

# Run tests
detox build
detox test
```

### Beta Testing

**iOS TestFlight:**
1. App Store Connect → TestFlight
2. Add internal testers (up to 100)
3. Add external testers (up to 10,000)
4. Upload build

**Android Internal Testing:**
1. Google Play Console → Testing → Internal testing
2. Upload APK/AAB
3. Add testers via email

---

## 🚀 Deployment Checklist

### Pre-Launch

- [ ] App icons for all sizes
- [ ] Screenshots for all device sizes
- [ ] App Store description finalized
- [ ] Privacy Policy published
- [ ] Terms of Service published
- [ ] Support email/website ready
- [ ] In-app purchase tested
- [ ] Analytics integrated
- [ ] Crash reporting (Sentry/Firebase)
- [ ] Rate limiting implemented
- [ ] Content moderation system
- [ ] User reporting mechanism

### Post-Launch

- [ ] Monitor crash reports
- [ ] Respond to user reviews
- [ ] Track key metrics
- [ ] Plan feature updates
- [ ] Build user community
- [ ] Pursue platform partnerships

---

## 📞 Support Resources

### React Native
- Docs: [reactnative.dev](https://reactnative.dev)
- Community: [react-native-community](https://github.com/react-native-community)

### Apple Developer
- Forums: [developer.apple.com/forums](https://developer.apple.com/forums)
- Documentation: [developer.apple.com/documentation](https://developer.apple.com/documentation)

### Google Play
- Support: [support.google.com/googleplay](https://support.google.com/googleplay/android-developer)

---

## 📄 License

MIT License - See LICENSE file

---

## 🤝 Contributing

We welcome contributions! Please:
1. Fork the repository
2. Create a feature branch
3. Submit a pull request

---

**Built with ❤️ for gig workers everywhere**

**Questions?** Email: support@jobsource.app

**Website:** [jobsource.app](https://jobsource.app)
