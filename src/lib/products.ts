export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  isUpsell?: boolean;
  requiredProducts?: string[];
  savings?: number;
}

export const PRODUCTS: Product[] = [
  {
    id: 'pack_1',
    name: 'Pack Excel Completo Pro - 13.000 Planilhas',
    description: 'Acesso completo a mais de 13.000 planilhas Excel profissionais + 50 dashboards extras premium. Categorias: Finanças, RH, Vendas, Engenharia, Logística, Pessoal e muito mais!',
    price: 12.99,
    originalPrice: 99.99,
    isUpsell: false,
    savings: 87.00,
  },
  {
    id: 'pack_2',
    name: 'Pack Office Premium - Templates Word + Slides PowerPoint',
    description: 'Upgrade completo: +2.000 templates Word + 50.000 slides PowerPoint + BÔNUS: 6.000 planilhas Excel extras',
    price: 39.99,
    originalPrice: 299.99,
    isUpsell: true,
    requiredProducts: ['pack_1'],
    savings: 260.00,
  },
];

export const getProductById = (id: string): Product | undefined => {
  return PRODUCTS.find(p => p.id === id);
};

export const getProductsByIds = (ids: string[]): Product[] => {
  return PRODUCTS.filter(p => ids.includes(p.id));
};
