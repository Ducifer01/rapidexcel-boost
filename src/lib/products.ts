export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
}

export const PRODUCTS: Product[] = [
  {
    id: 'pack_1',
    name: 'Pack Excel Completo Pro - 13.000 Planilhas',
    description: 'Acesso completo a mais de 13.000 planilhas Excel profissionais + 50 dashboards extras premium. Categorias: Finanças, RH, Vendas, Engenharia, Logística, Pessoal e muito mais!',
    price: 12.99,
  },
  {
    id: 'pack_2',
    name: 'Pack Office Premium - Templates Word + Slides PowerPoint',
    description: 'Upgrade completo: +2.000 templates Word profissionais + 50.000 slides PowerPoint para apresentações + BÔNUS: 6.000 planilhas Excel extras + materiais exclusivos',
    price: 29.99,
  },
];

export const getProductById = (id: string): Product | undefined => {
  return PRODUCTS.find(p => p.id === id);
};

export const getProductsByIds = (ids: string[]): Product[] => {
  return PRODUCTS.filter(p => ids.includes(p.id));
};
