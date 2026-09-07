import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import AuditLogs from './pages/AuditLogs';
import ForensicDetail from './pages/ForensicDetail';
import SecurityAnalytics from './pages/SecurityAnalytics';
import RetentionPolicy from './pages/RetentionPolicy';
import SchedulerMain from './pages/scheduler/SchedulerMain';
import TeamCapacity from './pages/scheduler/TeamCapacity';
import ConflictResolution from './pages/scheduler/ConflictResolution';

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/audit-logs" element={<AuditLogs />} />
                <Route path="/forensic-detail" element={<ForensicDetail />} />
                <Route path="/security-analytics" element={<SecurityAnalytics />} />
                <Route path="/retention-policy" element={<RetentionPolicy />} />
                <Route path="/scheduler" element={<SchedulerMain />} />
                <Route path="/scheduler/team/:teamId" element={<TeamCapacity />} />
                <Route path="/scheduler/conflicts" element={<ConflictResolution />} />
            </Routes>
        </BrowserRouter>
    );
}
