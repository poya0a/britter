export interface CompanyInterface {
  company_code: string;
  company_profile_seq: number;
  company_name: string;
  company_address: string;
}

export class CompanyModel implements CompanyInterface {
  company_code: string;
  company_profile_seq: number;
  company_name: string;
  company_address: string;

  constructor(company: CompanyInterface) {
    this.company_code = company.company_code;
    this.company_profile_seq = company.company_profile_seq;
    this.company_name = company.company_name;
    this.company_address = company.company_address;
  }
}
