// PhoneOverlay.tsx
import Image from 'next/image';
import React from 'react';

interface PhoneOverlayProps {
  children: React.ReactNode;
}

const PhoneOverlay: React.FC<PhoneOverlayProps> = ({ children }) => {
  return (
    <div style={{
      position: 'relative',
      width: 'fit-content',
      height: 'fit-content',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <Image src="/images/iPhone.png" alt="Phone" layout="fixed" width={300} height={600} />
      <div style={{
        position: 'absolute',
        top: '20%', 
        left: '5%',
        right: '5%',
        bottom: '20%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        {children}
      </div>
    </div>
  );
};

export default PhoneOverlay;
