# AccessiAI Chrome Extension

> **🎯 AI-Powered Accessibility Assistant** - 8-Agent Microservices Architecture for Real-Time Web Accessibility Enhancement

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/your-repo/accessiai-extension)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6+-blue)](https://www.typescriptlang.org/)
[![Chrome Extension](https://img.shields.io/badge/Chrome-Manifest%20V3-yellow)](https://developer.chrome.com/docs/extensions/mv3/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

## 🚀 Quick Start

```bash
# Clone and setup
git clone https://github.com/your-repo/accessiai-extension.git
cd accessiai-extension/accessiai-extension

# Install dependencies (Node.js 22+ required)
npm install

# Build extension
npm run build

# Load in Chrome
# 1. Open chrome://extensions/
# 2. Enable Developer mode
# 3. Click "Load unpacked" → select 'dist' folder
```

## ✨ Features

### 🤖 **8-Agent AI System**
- **CoordinationAgent** - Central message routing (<10ms response)
- **PerceptionAgent** - Real-time DOM analysis & WCAG validation
- **AdaptationAgent** - Intelligent DOM modifications
- **NavigationAgent** - Spatial mapping & keyboard navigation
- **CommunicationAgent** - Speech synthesis & recognition
- **LearningAgent** - User behavior analysis & personalization
- **AIProcessingAgent** - Chrome AI APIs integration (NEW)
- **CollaborationAgent** - Team accessibility features (NEW)

### 🎯 **Core Capabilities**
- **Real-Time Analysis** - Instant accessibility issue detection
- **WCAG 2.1 Compliance** - Comprehensive standards validation
- **One-Click Fixes** - Automated accessibility improvements
- **Visual Enhancements** - Color contrast, font size, spacing
- **Keyboard Navigation** - Enhanced focus management
- **Screen Reader Support** - Optimized ARIA attributes
- **Performance Monitoring** - <100ms analysis time target

## 👥 Use Cases

### 🦽 **For People with Disabilities**
- **Visual Impairments** - Enhanced screen reader support and high contrast modes
- **Motor Disabilities** - Improved keyboard navigation and larger click targets
- **Cognitive Disabilities** - Simplified content structure and clear navigation
- **Hearing Impairments** - Visual indicators and text alternatives for audio content

### 👨‍💻 **For Developers & Designers**
- **Web Developers** - Real-time WCAG compliance testing during development
- **UI/UX Designers** - Accessibility validation for design implementations
- **QA Engineers** - Automated accessibility testing in development workflow
- **Product Managers** - Accessibility compliance reporting and progress tracking

### 🏢 **For Organizations**
- **Legal Compliance** - Meet ADA, Section 508, and international accessibility standards
- **Quality Assurance** - Ensure consistent accessibility across all web properties
- **Best Practices** - Follow accessibility guidelines and industry standards
- **User Experience** - Create inclusive experiences for all users

### 🔍 **Real-World Testing Benefits**
- **Live Site Analysis** - Test actual user experiences on production websites
- **Instant Feedback** - Get immediate accessibility insights while browsing
- **Best Practice Guidance** - Learn accessibility principles through real examples
- **Development Integration** - Validate designs and implementations in real-time
- **Compliance Verification** - Ensure websites meet accessibility standards
- **User-Centered Design** - Understand how accessibility improvements benefit all users

## 🏗️ Architecture

### **Modern Tech Stack**
```typescript
// Core Technologies
Node.js 22+          // Latest LTS with performance improvements
TypeScript 5.6+      // Strict typing with latest features
Webpack 5.95+        // Modern bundling, zero deprecated dependencies
Chrome Manifest V3   // Latest extension APIs
ESLint 9+           // Flat config system
Jest 30+            // Latest testing framework
```

### **Project Structure**
```
accessiai-extension/
├── 📁 public/
│   ├── manifest.json        # Chrome Manifest V3
│   ├── popup.html          # Extension popup interface
│   └── icons/              # Extension icons (16, 32, 48, 128px)
├── 📁 src/
│   ├── background.ts       # Service Worker (message routing)
│   ├── content.ts          # Content Script (DOM injection)
│   ├── popup.ts           # Popup Interface
│   ├── 📁 agents/         # 8-Agent System
│   │   ├── BaseAgent.ts           # Abstract base class
│   │   ├── CoordinationAgent.ts   # Message router
│   │   ├── PerceptionAgent.ts     # DOM analysis
│   │   └── [6 more agents]...
│   ├── 📁 utils/          # Core Utilities
│   │   ├── MessageBus.ts          # Inter-agent communication
│   │   ├── StorageManager.ts      # IndexedDB operations
│   │   ├── AccessibilityScanner.ts # WCAG validation
│   │   └── [8 more utilities]...
│   ├── 📁 ui/             # User Interface
│   │   ├── AccessibilityPanel.ts  # Floating panel
│   │   ├── QuickActionControls.ts # One-click fixes
│   │   └── SettingsPanel.ts       # User preferences
│   └── 📁 types/          # TypeScript definitions
└── 📁 dist/              # Built extension (load in Chrome)
```

## 🎯 Implementation Status

### ✅ **Phase 1: Foundation Complete**
- **Chrome Extension Core** - Manifest V3, Service Worker, Content Script, Popup UI
- **Message Bus Architecture** - High-performance inter-agent communication
- **Agent Lifecycle Management** - Health monitoring and coordination
- **DOM Analysis Engine** - Real-time accessibility scanning
- **WCAG Compliance Scanner** - Comprehensive standards validation

### ✅ **Phase 2: Extended System Complete**
- **Content Structure Analyzer** - Heading hierarchy, landmark detection
- **Visual Analysis System** - Image/media analysis, layout validation
- **Accessibility Panel** - Floating interface with drag functionality
- **Quick Action Controls** - One-click fixes with keyboard shortcuts
- **Settings Management** - User preferences and profiles
- **IndexedDB Integration** - Persistent storage with 6 object stores
- **Status & Feedback System** - Real-time monitoring and user feedback
- **Chrome AI Integration** - Task 30 complete with content simplification

### 🚧 **Phase 3: Production Deployment** 
- **Production Build System** - Webpack optimization
- **Chrome Web Store Preparation** - Store listing, privacy policy
- **Production Monitoring** - Error tracking, analytics

### 🔮 **Future Enhancements** (Chrome AI Defined)
- **Chrome AI APIs Integration** - Prompt, Proofreader, Translator, Summarizer APIs
- **Advanced AI Processing** - Multi-modal content analysis and enhancement
- **Real-Time Collaboration** - Team-based accessibility management
- **Enterprise Features** - Advanced analytics and compliance reporting

## 🔧 Development

### **Prerequisites**
- Node.js 22+ (Latest LTS)
- npm 10+
- Chrome Browser (Developer mode)

### **Build Commands**
```bash
# Development build
npm run build

# Watch mode (auto-rebuild)
npm run watch

# Type checking
npm run type-check

# Linting
npm run lint

# Testing
npm run test

# Clean build
npm run clean && npm run build
```

### **Development Workflow**
1. **Make changes** to source files in `src/`
2. **Build extension** with `npm run build`
3. **Reload extension** in Chrome (chrome://extensions/)
4. **Test functionality** on web pages
5. **Check console** for errors/logs

## 🧪 Testing

### **Test Structure**
```bash
tests/
├── agents/           # Agent unit tests
├── utils/            # Utility function tests
├── integration/      # Integration tests
└── fixtures/         # Test data and mocks
```

### **Running Tests**
```bash
# All tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# Integration tests
npm run test:integration
```

## 📊 Performance Targets

### **Agent Performance**
| Agent | Response Time | Throughput | Accuracy |
|-------|---------------|------------|----------|
| Coordination | <10ms | 1000 msg/sec | 99.9% |
| Perception | <100ms | - | 95% |
| Adaptation | <50ms | - | 98% |

### **System Performance**
- **Memory Usage**: <75MB maximum
- **CPU Usage**: <7% maximum
- **Analysis Pipeline**: <200ms end-to-end
- **Build Time**: <4 seconds
- **Database Operations**: <100ms IndexedDB
- **UI Updates**: <50ms cross-component

## 🔐 Privacy & Security

### **Privacy-First Design**
- **Local Processing**: All analysis runs locally in browser
- **No Data Collection**: Zero user data sent to external servers
- **Encrypted Storage**: Local data encrypted with AES-GCM
- **Minimal Permissions**: Only required Chrome permissions requested

### **Security Features**
- **Content Security Policy**: Strict CSP implementation
- **Input Validation**: All user inputs sanitized
- **Secure Communication**: Encrypted inter-agent messaging
- **Privacy Audit**: Regular privacy compliance checks

## 📚 Documentation

### **Core Documentation**
- [**Architecture Guide**](./AGENT_ARCHITECTURE.md) - System design & patterns
- [**API Reference**](./API_CONTRACTS.md) - Agent interfaces & contracts

### **Implementation Guides**
- [**Success Summary**](./ACCESSIAI_EXTENSION_SUCCESS_SUMMARY.md) - Project achievements


## 🤝 Contributing

### **Development Setup**
1. **Fork** the repository
2. **Clone** your fork locally
3. **Install** dependencies: `npm install`
4. **Create** feature branch: `git checkout -b feature/amazing-feature`
5. **Make** changes and test thoroughly
6. **Build** and validate: `npm run build && npm test`
7. **Commit** changes: `git commit -m 'Add amazing feature'`
8. **Push** to branch: `git push origin feature/amazing-feature`
9. **Create** Pull Request

### **Code Standards**
- **TypeScript**: Strict mode enabled
- **ESLint**: Flat config (ESLint 9+)
- **Prettier**: Code formatting
- **Jest**: Unit & integration testing
- **Naming**: PascalCase for classes, camelCase for variables
- **Imports**: Relative paths only (no @/ aliases)

## 🏆 Project Achievements

### **From Broken to Professional**
- ✅ **500+ errors** → **0 errors**
- ✅ **Deprecated dependencies** → **Modern stack**
- ✅ **Corrupted code** → **Clean architecture**
- ✅ **Build failures** → **Successful compilation**

### **Technical Excellence**
- ✅ **Zero TypeScript errors**
- ✅ **Modern dependency stack**
- ✅ **Comprehensive type safety**
- ✅ **Performance-optimized architecture**
- ✅ **Scalable agent system**

## 📈 Roadmap

### **Version 2.0 (Production Ready)**
- ✅ Chrome Extension Foundation
- ✅ Extended System Implementation
- 🚧 Production Deployment
- 📋 Chrome Web Store Launch

### **Version 2.1 (Chrome AI Integration)**
- 📋 **Chrome AI Foundation** - AI service detection and compatibility
- 📋 **Prompt API Integration** - AI-powered content generation
- 📋 **Proofreader API Integration** - Real-time text assistance
- 📋 **Translator API Integration** - Multilingual accessibility
- 📋 **Summarizer API Integration** - Content simplification ✅
- 📋 **AI Performance & Testing** - Optimization and validation

### **Version 3.0 (Platform Expansion)**
- 📋 Cross-browser Support (Firefox, Safari)
- 📋 Mobile Accessibility Features
- 📋 API Integration Platform
- 📋 Developer SDK & Enterprise Features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Chrome Extensions Team** - For Manifest V3 APIs
- **WCAG Working Group** - For accessibility standards
- **Open Source Community** - For tools and libraries
- **Accessibility Advocates** - For guidance and feedback

---

<div align="center">

**Built with ❤️ for a more accessible web**

[🌐 Website](https://your-website.com) • [📧 Contact](mailto:contact@your-email.com) • [🐛 Issues](https://github.com/abdelrazekrizk/accessiai-chrome-extension/issues) • [💬 Discussions](https://github.com/your-repo/discussions)

</div>