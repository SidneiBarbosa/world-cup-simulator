import React from 'react';

// Maps 3-letter FIFA codes to 2-letter ISO codes for the Flag API
const CODE_MAP = {
  // Group A
  MEX: 'mx', RSA: 'za', KOR: 'kr', EUD: null,
  // Group B
  CAN: 'ca', QAT: 'qa', SUI: 'ch', EUA: null,
  // Group C - BRAZIL IS HERE
  BRA: 'br', MAR: 'ma', HAI: 'ht', SCO: 'gb-sct',
  // Group D
  USA: 'us', PAR: 'py', AUS: 'au', EUC: null,
  // Group E
  GER: 'de', CUW: 'cw', CIV: 'ci', ECU: 'ec',
  // Group F
  NED: 'nl', JPN: 'jp', TUN: 'tn', EUB: null,
  // Group G
  BEL: 'be', EGY: 'eg', IRN: 'ir', NZL: 'nz',
  // Group H
  ESP: 'es', CPV: 'cv', KSA: 'sa', URU: 'uy',
  // Group I
  FRA: 'fr', SEN: 'sn', NOR: 'no', IC2: null,
  // Group J
  ARG: 'ar', ALG: 'dz', AUT: 'at', JOR: 'jo',
  // Group K
  POR: 'pt', UZB: 'uz', COL: 'co', IC1: null,
  // Group L
  ENG: 'gb-eng', CRO: 'hr', GHA: 'gh', PAN: 'pa',

  // Playoff Candidates
  ITA: 'it', NIR: 'gb-nir', WAL: 'gb-wls', BIH: 'ba',
  UKR: 'ua', SWE: 'se', POL: 'pl', ALB: 'al',
  TUR: 'tr', ROU: 'ro', SVK: 'sk', KOS: 'xk',
  CZE: 'cz', IRL: 'ie', DEN: 'dk', MKD: 'mk',
  COD: 'cd', JAM: 'jm', NCL: 'nc',
  BOL: 'bo', SUR: 'sr', IRQ: 'iq'
};

const Flag = ({ isoCode, className = "w-6 h-4" }) => {
  if (!isoCode) return null;

  const iso2 = CODE_MAP[isoCode];

  // Debug: Uncomment the line below if flags are still missing to see why in Console
  // console.log(`Flag lookup: ${isoCode} -> ${iso2}`);

  if (iso2) {
    return (
      <img 
        src={`https://flagcdn.com/${iso2}.svg`} 
        alt={isoCode} 
        className={`inline-block shadow-sm object-cover rounded-sm ${className}`}
      />
    );
  }

  // Fallback for placeholders
  return (
    <span className={`inline-flex items-center justify-center bg-gray-200 text-gray-500 rounded-full text-[10px] font-bold ${className}`}>
      ?
    </span>
  );
};

export default Flag;