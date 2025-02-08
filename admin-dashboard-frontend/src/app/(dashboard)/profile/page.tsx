import RevenueAreaChart from '@/components/charts/AreaChart';
import React from 'react';

export default function ProfilePage() {
    return (
        <>
            <div className='m-4'>
                <h1>Profile</h1> 
                <RevenueAreaChart />
                {/* Add more dashboard-specific content here */}
            </div>
        </>
    );
}
