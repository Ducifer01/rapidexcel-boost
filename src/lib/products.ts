export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
}

export const PRODUCTS: Product[] = [
  {
    id: 'pack_1',
    name: 'Planilhas 6k Pro - 6.000 Planilhas Excel',
    description: 'Acesso a 6.000 planilhas editáveis em todas as categorias',
    price: 12.99,
  },
  {
    id: 'pack_2',
    name: 'Dashboards+Bônus - 1.000 Dashboards + Bônus',
    description: 'Acesso a 1.000 dashboards profissionais + bônus especial',
    price: 12.99,
  },
];

export const getProductById = (id: string): Product | undefined => {
  return PRODUCTS.find(p => p.id === id);
};

export const getProductsByIds = (ids: string[]): Product[] => {
  return PRODUCTS.filter(p => ids.includes(p.id));
};
