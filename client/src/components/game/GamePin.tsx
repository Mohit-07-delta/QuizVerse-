'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiCopy, FiCheck, FiShare2, FiGrid } from 'react-icons/fi';
import { QRCodeSVG } from 'qrcode.react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface GamePinProps {
  pin: string;
}

export function GamePin({ pin }: GamePinProps) {
  const [copied, setCopied] = useState(false);
  const joinUrl = typeof window !== 'undefined' ? `${window.location.origin}/play?pin=${pin}` : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(pin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(joinUrl);
    alert('Join link copied to clipboard!');
  };

  return (
    <div className="w-full max-w-md mx-auto text-center">
      <Card className="p-6 bg-dark-800/40 border border-purple-500/15 backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-cyan-500 to-pink-500" />
        
        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
          Join with Game PIN
        </span>

        {/* PIN DISPLAY */}
        <h2 className="text-5xl md:text-6xl font-extrabold font-heading text-white tracking-widest my-4 selection:bg-purple-500/30">
          {pin}
        </h2>

        {/* Buttons */}
        <div className="flex justify-center gap-3 mb-6">
          <Button variant="secondary" size="sm" onClick={handleCopy} className="flex items-center gap-1">
            {copied ? (
              <>
                <FiCheck className="text-green-400" /> Copied PIN
              </>
            ) : (
              <>
                <FiCopy /> Copy PIN
              </>
            )}
          </Button>
          <Button variant="secondary" size="sm" onClick={handleCopyLink} className="flex items-center gap-1">
            <FiShare2 /> Copy Link
          </Button>
        </div>

        {/* QR Code Container */}
        <div className="bg-white p-4 rounded-xl inline-block shadow-2xl relative z-10 border border-purple-500/10 mb-2">
          {joinUrl ? (
            <QRCodeSVG value={joinUrl} size={150} fgColor="#09090b" bgColor="#ffffff" level="Q" />
          ) : (
            <div className="w-[150px] h-[150px] flex items-center justify-center text-dark-900 text-xs font-semibold">
              Generating...
            </div>
          )}
        </div>

        <p className="text-xs text-gray-400 font-sans mt-2">
          Or scan the QR code to join instantly
        </p>
      </Card>
    </div>
  );
}
export default GamePin;
