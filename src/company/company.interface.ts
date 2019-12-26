export interface CompanyData {
    id: number;
    name: string;
    description: string;
    created: Date;
    updated: Date;
}

export interface CompanyRO {
    company: CompanyData;
}