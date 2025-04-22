export interface ManufacturerProfile {
  id: string;
  representative_name: string;
  company_name: string;
  company_address: string;
  phone: string;
  operation_country: string;
  tax_id: string;
}

export interface Manufacturer {
  id: string;
  email: string;
  role: string;
  authorized: boolean;
  created_at: string;
  cognito_id: string;
  profile: ManufacturerProfile;
}

export interface Users {
  users: Manufacturer[];
}
