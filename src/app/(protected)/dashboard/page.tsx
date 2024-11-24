"use client";
import React from 'react';
import { useUser } from '@clerk/nextjs';

const Dashboard = () => {
    const { user } = useUser();
    return (
        <div>
            {/* {user?.imageUrl && <img src={user.imageUrl} alt="User Image" />} */}
            <div>{user?.firstName}</div>
        </div>
    );
};

export default Dashboard;