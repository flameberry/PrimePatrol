// src/app/(dashboard)/layout.tsx


import React from 'react';
import SessionWrapper from '@/hooks/SessionWrapper';
import SideBarLayout from '../../components/SideBarLayout';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <SessionWrapper>
            <SideBarLayout>
                {children}
            </SideBarLayout>
        </SessionWrapper>
    );
}