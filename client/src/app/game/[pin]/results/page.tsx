'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ResultsScreen } from '@/components/game/ResultsScreen';
import { Spinner } from '@/components/ui/Spinner';

export default function GameResultsPage() {
  const params = useParams();
  const pin = params?.pin as string;

  const [loading, setLoading] = useState(true);
  const [podium, setPodium] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [myStats, setMyStats] = useState<any | null>(null);
  const [myNickname, setMyNickname] = useState<string | null>(null);

  useEffect(() => {
    // Read state from sessionStorage
    const storedPodium = sessionStorage.getItem('final_podium');
    const storedLeaderboard = sessionStorage.getItem('final_leaderboard');
    const storedMyStats = sessionStorage.getItem('final_my_stats');
    const storedNickname = sessionStorage.getItem('play_nickname');

    if (storedPodium) setPodium(JSON.parse(storedPodium));
    if (storedLeaderboard) setLeaderboard(JSON.parse(storedLeaderboard));
    if (storedMyStats) setMyStats(JSON.parse(storedMyStats));
    if (storedNickname) setMyNickname(storedNickname);

    setLoading(false);
  }, [pin]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col justify-between py-12">
      <ResultsScreen
        podium={podium}
        leaderboard={leaderboard}
        myStats={myStats}
        myNickname={myNickname}
      />
    </div>
  );
}
