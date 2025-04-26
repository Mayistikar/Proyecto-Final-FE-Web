import { Product } from './product.model';

describe('Product Model', () => {
  it('should create an instance with default values', () => {
    const product = new Product();
    expect(product).toBeTruthy();
    expect(product.id).toBe('');
    expect(product.name).toBe('');
    expect(product.description).toBe('');
    expect(product.category).toBe('');
    expect(product.price).toBe(0);
    expect(product.imageUrl).toBe('');
    expect(product.stock).toBe(0);
    expect(product.sku).toBe('');
    expect(product.expirationDate).toBe('');
    expect(product.deliveryTime).toBe(0);
    expect(product.storageConditions).toBe('');
    expect(product.commercialConditions).toBe('');
    expect(product.isPerishable).toBeFalse();
    expect(product.currency).toBe('COP');
    expect(product.warehouse).toBe('');
  });

  it('should create an instance with provided values', () => {
    const product = new Product(
      '123',
      'Test Product',
      'A great product',
      'Food',
      9.99,
      'https://image.url',
      100,
      'SKU123',
      '2025-12-31',
      3,
      'Keep refrigerated',
      'Sold in bulk',
      true,
      'USD',
      'bodega-001'
    );

    expect(product.id).toBe('123');
    expect(product.name).toBe('Test Product');
    expect(product.description).toBe('A great product');
    expect(product.category).toBe('Food');
    expect(product.price).toBe(9.99);
    expect(product.imageUrl).toBe('https://image.url');
    expect(product.stock).toBe(100);
    expect(product.sku).toBe('SKU123');
    expect(product.expirationDate).toBe('2025-12-31');
    expect(product.deliveryTime).toBe(3);
    expect(product.storageConditions).toBe('Keep refrigerated');
    expect(product.commercialConditions).toBe('Sold in bulk');
    expect(product.isPerishable).toBeTrue();
    expect(product.currency).toBe('USD');
    expect(product.warehouse).toBe('bodega-001');
  });
});
