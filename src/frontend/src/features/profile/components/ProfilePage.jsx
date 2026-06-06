import React from 'react';
import TenantManager from './TenantManager';
import CustomerProfile from './CustomerProfile';
import useAppStore from '../../../store/useAppStore';

function ProfilePage() {
  const role = useAppStore((state) => state.role);

  return (
    <div className="profile-section">
      {role === 'OWNER' && <TenantManager />}
      {role === 'CLIENT' && <CustomerProfile />}
    </div>
  );
}

export default ProfilePage;
