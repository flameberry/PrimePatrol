"use client";

import React, { useState, useCallback } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { Collapse } from '@mui/material';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import debounce from 'lodash/debounce';
import Header from './Header/Header';
import { AccountTreeIcon, ExpandLessIcon, ExpandMoreIcon, InboxIcon, MoreVertIcon, OnDeviceTrainingIcon, PeopleAltIcon, SettingsInputComponentIcon, SpaceDashboardIcon } from '@/lib/icons';

const drawerWidth = 240;

interface Props {
    window?: () => Window;
    children: React.ReactNode;
}

export default function SideBarLayout(props: Props) {
    const { window, children } = props;
    const [mobileOpen, setMobileOpen] = useState(false);
    const [isCollapse, setIsCollapse] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    const handleCollapse = () => {
        setIsCollapse(!isCollapse);
    };

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    // Debounce the navigation function
    const debouncedNavigate = useCallback(
        debounce((path: string) => {
            router.push(path);
        }, 100),
        [router] // Add router as a dependency
    );

    const drawer = (
        <div>
            <Toolbar sx={{ bgcolor: '#1E293B', color: '#FFFFFF' }}>
                <Image src="/app-logo.png" alt="app logo" width={60} height={100} />
                <Typography variant="h6" noWrap component="div" sx={{ ml: 2 }}>
                    SmartWater
                </Typography>
            </Toolbar>
            <Divider />
            <List>
                {['Dashboard', 'Projects', 'Workers', 'Settings'].map((text, index) => (
                    <ListItem
                        key={text}
                        disablePadding
                        sx={{
                            bgcolor: pathname.startsWith("/" + text.toLowerCase()) ? '#E2E8F0' : 'transparent',
                            '&:hover': {
                                bgcolor: '#F1F5F9',
                            },
                        }}
                    >
                        <ListItemButton
                            onClick={() => debouncedNavigate("/" + text.toLowerCase())}
                            sx={{
                                color: pathname.startsWith("/" + text.toLowerCase()) ? '#1E40AF' : '#4A5568',
                                '&:hover': {
                                    color: '#1E40AF',
                                },
                            }}
                        >
                            <ListItemIcon
                                sx={{
                                    color: pathname.startsWith("/" + text.toLowerCase()) ? '#1E40AF' : '#4A5568',
                                }}
                            >
                                {index === 0 && <SpaceDashboardIcon />}
                                {index === 1 && <AccountTreeIcon />}
                                {index === 2 && <PeopleAltIcon />}
                                {index === 3 && <SettingsInputComponentIcon />}
                            </ListItemIcon>
                            <ListItemText primary={text} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
            <Divider />
            <List>
                <ListItem disablePadding onClick={handleCollapse}>
                    <ListItemButton>
                        <ListItemIcon>
                            <MoreVertIcon />
                        </ListItemIcon>
                        <ListItemText primary="More" />
                        {isCollapse ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </ListItemButton>
                </ListItem>
            </List>
            <Collapse in={isCollapse} timeout="auto" unmountOnExit>
                <Box sx={{ marginLeft: 2, marginRight: 2 }}>
                    <List>
                        {['Support', 'Contact'].map((text, index) => (
                            <ListItem key={text} disablePadding>
                                <ListItemButton>
                                    <ListItemIcon>
                                        {index % 2 === 0 ? <InboxIcon /> : <OnDeviceTrainingIcon />}
                                    </ListItemIcon>
                                    <ListItemText primary={text} />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                </Box>
            </Collapse>
        </div>
    );

    const container = window !== undefined ? () => window().document.body : undefined;

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar
                position="fixed"
                sx={{
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    ml: { sm: `${drawerWidth}px` },
                    bgcolor: '#FFFFFF',
                    color: '#2F2F2F',
                    boxShadow: 'none',
                    borderBottom: '1px solid #E2E8F0',
                }}
            >
                <Header />
            </AppBar>
            <Box
                component="nav"
                sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
                aria-label="mailbox folders"
            >
                <Drawer
                    container={container}
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true,
                    }}
                    sx={{
                        display: { xs: 'block', sm: 'none' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                >
                    {drawer}
                </Drawer>
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', sm: 'block' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>
            <Box
                component="main"
                sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
            >
                <Toolbar />
                {children}
            </Box>
        </Box>
    );
}