import { Seller } from './seller.model';

describe('Seller Model', () => {
  let defaultSeller: Seller;
  let customSeller: Seller;

  const sampleProps = {
    id: '1',
    name: 'Irina',
    email: 'irina@example.com',
    phone: '3001234567',
    address: 'Calle 123',
    zone: 'Zona Norte',
    specialty: 'Especialidad',
    password: 'password123'
  };

  beforeEach(() => {
    defaultSeller = new Seller();
    customSeller = new Seller(
      sampleProps.id,
      sampleProps.name,
      sampleProps.email,
      sampleProps.phone,
      sampleProps.address,
      sampleProps.zone,
      sampleProps.specialty,
      sampleProps.password
    );
  });

  it('should create an instance with default values', () => {
    expect(defaultSeller).toBeInstanceOf(Seller);
    expect(defaultSeller.id).toBe('');
    expect(defaultSeller.name).toBe('');
    expect(defaultSeller.email).toBe('');
    expect(defaultSeller.phone).toBe('');
    expect(defaultSeller.address).toBe('');
    expect(defaultSeller.zone).toBe('');
    expect(defaultSeller.specialty).toBe('');
    expect(defaultSeller.password).toBe('');
  });

  it('should create an instance with provided values', () => {
    expect(customSeller).toBeInstanceOf(Seller);
    expect(customSeller.id).toBe(sampleProps.id);
    expect(customSeller.name).toBe(sampleProps.name);
    expect(customSeller.email).toBe(sampleProps.email);
    expect(customSeller.phone).toBe(sampleProps.phone);
    expect(customSeller.address).toBe(sampleProps.address);
    expect(customSeller.zone).toBe(sampleProps.zone);
    expect(customSeller.specialty).toBe(sampleProps.specialty);
    expect(customSeller.password).toBe(sampleProps.password);
  });

  it('should assign individual properties correctly', () => {
    expect(customSeller.name).toBe(sampleProps.name);
    expect(customSeller.email).toBe(sampleProps.email);
    expect(customSeller.phone).toBe(sampleProps.phone);
    expect(customSeller.zone).toBe(sampleProps.zone);
  });
});

