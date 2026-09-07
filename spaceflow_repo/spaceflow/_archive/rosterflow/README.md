# RosterFlow Scheduler

A modern, dark-themed workforce scheduling and resource management system built with React and Tailwind CSS.

## Features

### 📅 Main Scheduler Dashboard
- **Gantt-style Timeline View**: Visual representation of team schedules with drag-and-drop capability
- **Available Personnel Panel**: Real-time status of available staff members
- **Pending Orders Queue**: Work orders awaiting assignment with priority indicators
- **Live Sync**: Real-time updates to roster changes
- **Conflict Detection**: Automatic detection of scheduling conflicts with visual alerts

### 👥 Team Capacity Management
- **Individual Staff Timeline**: Detailed view of each team member's shift assignments
- **Fatigue Tracking**: Visual representation of staff fatigue levels with color-coded meters
- **Resource Assignment**: Vehicle and equipment tracking for each team
- **Tool Inventory**: Real-time tool checkout status and availability
- **Team Efficiency Meter**: Overall team performance visualization

### 🔧 Conflict Resolution Center
- **AI-Powered Suggestions**: Smart recommendations for resolving scheduling conflicts
- **Side-by-Side Comparison**: Visual comparison of conflicting assignments
- **Impact Analysis**: Assess the effects of resolution strategies on coverage and efficiency
- **Conflict Queue**: Prioritized list of all scheduling conflicts
- **Resolution Metrics**: Track system confidence and reliability scores

### 🎨 Design Highlights
- **Dark Mode**: Premium dark theme with vibrant accent colors
- **Responsive Layout**: Optimized for desktop and large displays
- **Material Icons**: Comprehensive icon library for consistent UI
- **Custom Scrollbars**: Styled scrollbars matching the dark theme
- **Smooth Animations**: Subtle hover effects and transitions

## Technology Stack

- **React 18**: Modern React with hooks
- **React Router DOM**: Client-side routing
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **@tailwindcss/forms**: Form styling plugin
- **Material Icons**: Google's material design icons

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

1. Navigate to the project directory:
```bash
cd rosterflow
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:3002`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
rosterflow/
├── src/
│   ├── pages/
│   │   ├── SchedulerMain.jsx       # Main Gantt scheduler view
│   │   ├── TeamCapacity.jsx        # Team detail with fatigue tracking
│   │   └── ConflictResolution.jsx  # AI-powered conflict resolution
│   ├── App.jsx                     # Main app with routing
│   ├── main.jsx                    # App entry point
│   └── index.css                   # Global styles and Tailwind
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

## Color Palette

- **Primary**: `#3b82f6` (Blue)
- **Background Dark**: `#0f172a` (Slate 950)
- **Surface Dark**: `#1e293b` (Slate 800)
- **Accent Blue**: `#60a5fa`
- **Accent Emerald**: `#34d399`
- **Accent Amber**: `#fbbf24`
- **Accent Red**: `#f87171`

## Key Features in Detail

### Scheduling Conflicts
The system automatically detects:
- Personnel double-booking
- Skill gaps in team assignments
- Rest compliance violations
- Resource conflicts

### Smart Recommendations
AI-powered suggestions consider:
- Coverage impact
- Response time optimization
- Staff fatigue levels
- Skill matching

### Resource Management
Track and assign:
- Vehicles with fuel and mileage monitoring
- Tools and equipment with serial numbers
- Team efficiency metrics
- Real-time availability status

## Navigation

- **Main Scheduler** (`/`): Overview of all teams and shifts
- **Team Capacity** (`/team/:teamId`): Detailed view of individual team
- **Conflict Resolution** (`/conflicts`): Resolve scheduling conflicts

## Future Enhancements

- Drag-and-drop shift assignment
- Real-time WebSocket updates
- Mobile responsive design
- Custom reporting and analytics
- Integration with HR systems
- Historical data analysis
- Predictive scheduling

## License

This project is part of the ReclamTrack enterprise suite.

---

**Version**: 4.2.1-BETA  
**System Uptime**: 99.9%
