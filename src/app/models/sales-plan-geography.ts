//src/app/models/sales-plan-geography.ts

export const SECTOR_TO_ZONE: Record<string, string> = {
    'Zona Norte'       : 'ZONE_BOGOTA',
    'Zona Sur'         : 'ZONE_BOGOTA',
    'Zona Chapinero'   : 'ZONE_BOGOTA',
    'Zona Engativá'    : 'ZONE_BOGOTA',
    'Zona Kennedy'     : 'ZONE_BOGOTA',
    'Zona Usaquén'     : 'ZONE_BOGOTA',
  
    'Zona Centro'      : 'ZONE_MEDELLIN',
    'Zona Belén'       : 'ZONE_MEDELLIN',
    'Zona El Poblado'  : 'ZONE_MEDELLIN',
    'Zona Castilla'    : 'ZONE_MEDELLIN',
    'Zona Aranjuez'    : 'ZONE_MEDELLIN',
    'Zona La América'  : 'ZONE_MEDELLIN',
  
    'Zona Norte Cali'  : 'ZONE_CALI',
    'Zona Sur Cali'    : 'ZONE_CALI',
    'Aguablanca'       : 'ZONE_CALI',
    'San Fernando'     : 'ZONE_CALI',
    'Siloé'            : 'ZONE_CALI',
    'La Floresta'      : 'ZONE_CALI',
  
    'Norte B/quilla'   : 'ZONE_BARRANQUILLA',
    'Sur B/quilla'     : 'ZONE_BARRANQUILLA',
    'El Prado'         : 'ZONE_BARRANQUILLA',
    'Santo Domingo'    : 'ZONE_BARRANQUILLA',
    'Simón Bolívar'    : 'ZONE_BARRANQUILLA',
    'La Luz'           : 'ZONE_BARRANQUILLA',
  
    'Brooklyn'         : 'ZONE_NEW_YORK',
    'Queens'           : 'ZONE_NEW_YORK',
    'Manhattan'        : 'ZONE_NEW_YORK',
    'Bronx'            : 'ZONE_NEW_YORK',
    'Staten Island'    : 'ZONE_NEW_YORK',
    'Harlem'           : 'ZONE_NEW_YORK',
  
    'San Francisco'    : 'ZONE_CALIFORNIA',
    'Los Angeles'      : 'ZONE_CALIFORNIA',
    'San Diego'        : 'ZONE_CALIFORNIA',
    'San José'         : 'ZONE_CALIFORNIA',
    'Sacramento'       : 'ZONE_CALIFORNIA',
    'Oakland'          : 'ZONE_CALIFORNIA',
  
    'Dallas'           : 'ZONE_TEXAS',
    'Houston'          : 'ZONE_TEXAS',
    'Austin'           : 'ZONE_TEXAS',
    'San Antonio'      : 'ZONE_TEXAS',
    'El Paso'          : 'ZONE_TEXAS',
    'Fort Worth'       : 'ZONE_TEXAS',
  
    'Miami'            : 'ZONE_FLORIDA',
    'Orlando'          : 'ZONE_FLORIDA',
    'Tampa'            : 'ZONE_FLORIDA',
    'Jacksonville'     : 'ZONE_FLORIDA',
    'Naples'           : 'ZONE_FLORIDA',
    'Fort Lauderdale'  : 'ZONE_FLORIDA',
  
    '': 'ZONE_BOGOTA' 
  };
  
  export const ZONE_TO_COUNTRY: Record<string, string> = {
    ZONE_BOGOTA      : 'COVERAGE_COLOMBIA',
    ZONE_MEDELLIN    : 'COVERAGE_COLOMBIA',
    ZONE_CALI        : 'COVERAGE_COLOMBIA',
    ZONE_BARRANQUILLA: 'COVERAGE_COLOMBIA',
    ZONE_NEW_YORK    : 'COVERAGE_USA',
    ZONE_CALIFORNIA  : 'COVERAGE_USA',
    ZONE_TEXAS       : 'COVERAGE_USA',
    ZONE_FLORIDA     : 'COVERAGE_USA'
  };