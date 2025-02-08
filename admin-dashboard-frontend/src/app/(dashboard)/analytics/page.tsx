import RevenueAreaChart from '@/components/charts/AreaChart';
import SideBarLayout from '@/components/sidebarLayout';
import React from 'react';

export default function AnalyticsPage() {
    return (
        <>
            <div className='m-4'>
                <h1>Analytics</h1> 
                <RevenueAreaChart />
                {/* Add more dashboard-specific content here */}
            </div>
        </>
    );
}
