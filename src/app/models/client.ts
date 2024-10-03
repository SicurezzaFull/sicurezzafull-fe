export interface Client {
    id?: number;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    postalCode?: string;
    country?: string;
    vat?: string;            // Partita IVA
    pec?: string;            // Posta Elettronica Certificata
    signature?: string;       // Firma
    logo?: string;           // Logo aziendale
    status?: boolean;
}
