import React from 'react';
import SvgIcon from '@mui/material/SvgIcon';

export default function Logo(props){
  return (
    <SvgIcon {...props} viewBox="0 0 64 64">
      <rect x="4" y="10" width="40" height="36" rx="4" fill="none" stroke="currentColor" strokeWidth="2"/>
      <circle cx="50" cy="46" r="4" fill="currentColor"/>
      <circle cx="58" cy="46" r="4" fill="currentColor"/>
      <path d="M6 18h34" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <text x="8" y="52" fontSize="10" fill="currentColor">G</text>
    </SvgIcon>
  );
}
