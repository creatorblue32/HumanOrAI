// src/pages/page.tsx
import JoinGameCard from '@/components/JoinGameCard';
import DatabaseRead from '@/components/JoinGameCard';

export default function Page() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <JoinGameCard />
    </div>
  );
}

