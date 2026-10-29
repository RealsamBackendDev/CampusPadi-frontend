export const SCHOOLS = {
  UI: {
    label: 'University of Ibadan',
    short: 'UI',
    primary: '#1B2A6B',
    accent: '#C9A227',
  },
  POLY_IBADAN: {
    label: 'The Polytechnic, Ibadan',
    short: 'Poly Ibadan',
    primary: '#1A1A1A',
    accent: '#D4AF37',
  },
  LEAD_CITY: {
    label: 'Lead City University',
    short: 'Lead City',
    primary: '#1D4ED8',
    accent: '#EC4899',
  },
  LAUTECH: {
    label: 'LAUTECH',
    short: 'LAUTECH',
    primary: '#7B1E1E',
    accent: '#C9A227',
  },
};

export const getSchoolTheme = (school) => SCHOOLS[school] || SCHOOLS.UI;