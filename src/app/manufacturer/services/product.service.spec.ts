import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProductService } from './product.service';
import { Product } from '../../models/product.model';
import {Observable, of} from 'rxjs';

describe('ProductService', () => {
  let service: ProductService;
  let httpMock: HttpTestingController;

  const baseUrl = 'https://kxa0nfrh14.execute-api.us-east-1.amazonaws.com/prod/api';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProductService]
    });
    service = TestBed.inject(ProductService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });


  it('should retrieve all products', () => {
    service.getProducts().subscribe(products => {
      expect(products).toBeTruthy();
    });

    const req = httpMock.expectOne(`${baseUrl}/products`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should get a product by id', () => {
    const productId = '123';
    service.getProductById(productId).subscribe(product => {
      expect(product).toBeTruthy();
    });

    const req = httpMock.expectOne(`${baseUrl}/products/${productId}`);
    expect(req.request.method).toBe('GET');
    req.flush({ id: productId });
  });

  it('should update a product by id', () => {
    const productId = '123';
    const updatedProduct = { name: 'Updated Product' };

    service.updateProduct(productId, updatedProduct).subscribe(response => {
      expect(response).toBeTruthy();
    });

    const req = httpMock.expectOne(`${baseUrl}/products/${productId}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updatedProduct);
    req.flush({ success: true });
  });

  it('should return presigned URL for S3 upload', () => {
    const fileName = 'image.png';
    service.getPresignedUrl(fileName).subscribe(urls => {
      expect(urls.uploadUrl).toContain(fileName);
      expect(urls.publicUrl).toContain(fileName);
    });
  });

  it('should upload file to S3 using provided URL', () => {
    const uploadUrl = 'https://s3.amazonaws.com/bucket/image.png';
    const mockFile = new File([''], 'image.png', { type: 'image/png' });

    service.uploadToS3(uploadUrl, mockFile).subscribe(response => {
      expect(response).toBeTruthy();
    });

    const req = httpMock.expectOne(uploadUrl);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toBe(mockFile);
    expect(req.request.headers.get('Content-Type')).toBe(mockFile.type);
    req.flush({ success: true });
  });

  it('should get products by manufacturer ID', () => {
    const manufacturerId = 'm123';
    service.getProductsByManufacturer(manufacturerId).subscribe(products => {
      expect(products).toBeTruthy();
    });

    const req = httpMock.expectOne(`${baseUrl}/products?manufacturerId=${manufacturerId}`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should create product WITHOUT image file', () => {
    const mockProduct = { name: 'Gadget', price: 42 };
    let responseBody: any;

    service.createProduct(mockProduct).subscribe(res => (responseBody = res));

    const req = httpMock.expectOne(`${baseUrl}/products`);
    expect(req.request.method).toBe('POST');

    const body = req.request.body as FormData;
    expect(body instanceof FormData).toBeTrue();
    expect(body.get('product')).toBe(JSON.stringify(mockProduct));
    expect(body.get('image')).toBeNull();

    req.flush({ ok: true });
    expect(responseBody).toEqual({ ok: true });
  });

  it('should create product WITH image file', () => {
    const mockProduct = { name: 'Widget', price: 99 };
    const mockFile = new File(['file-content'], 'photo.png', { type: 'image/png' });
    let responseBody: any;

    service.createProduct(mockProduct, mockFile).subscribe(res => (responseBody = res));

    const req = httpMock.expectOne(`${baseUrl}/products`);
    expect(req.request.method).toBe('POST');

    const body = req.request.body as FormData;
    expect(body instanceof FormData).toBeTrue();

    expect(body.get('product')).toBe(JSON.stringify(mockProduct));

    const sentFile = body.get('image') as File;
    expect(sentFile).toBeTruthy();
    expect(sentFile.name).toBe(mockFile.name);
    expect(sentFile.type).toBe(mockFile.type);

    req.flush({ ok: true });
    expect(responseBody).toEqual({ ok: true });
  });

  it('should handle error when retrieving all products', () => {
      service.getProducts().subscribe({
        next: () => fail('Expected an error, but got a response'),
        error: (error) => {
          expect(error.status).toBe(500);
        }
      });

      const req = httpMock.expectOne(`${baseUrl}/products`);
      req.flush('Error', { status: 500, statusText: 'Internal Server Error' });
    });

    it('should handle error when getting a product by id', () => {
      const productId = 'invalid-id';
      service.getProductById(productId).subscribe({
        next: () => fail('Expected an error, but got a response'),
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${baseUrl}/products/${productId}`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
    });

    it('should handle error when updating a product', () => {
      const productId = '123';
      const updatedProduct = { name: 'Updated Product' };

      service.updateProduct(productId, updatedProduct).subscribe({
        next: () => fail('Expected an error, but got a response'),
        error: (error) => {
          expect(error.status).toBe(400);
        }
      });

      const req = httpMock.expectOne(`${baseUrl}/products/${productId}`);
      req.flush('Bad Request', { status: 400, statusText: 'Bad Request' });
    });

    it('should handle error when creating a product WITHOUT image file', () => {
      const mockProduct = { name: 'Gadget', price: 42 };

      service.createProduct(mockProduct).subscribe({
        next: () => fail('Expected an error, but got a response'),
        error: (error) => {
          expect(error.status).toBe(500);
        }
      });

      const req = httpMock.expectOne(`${baseUrl}/products`);
      req.flush('Internal Server Error', { status: 500, statusText: 'Internal Server Error' });
    });

    it('should handle error when creating a product WITH image file', () => {
      const mockProduct = { name: 'Widget', price: 99 };
      const mockFile = new File(['file-content'], 'photo.png', { type: 'image/png' });

      service.createProduct(mockProduct, mockFile).subscribe({
        next: () => fail('Expected an error, but got a response'),
        error: (error) => {
          expect(error.status).toBe(400);
        }
      });

      const req = httpMock.expectOne(`${baseUrl}/products`);
      req.flush('Bad Request', { status: 400, statusText: 'Bad Request' });
    });

    it('should handle error when getting products by manufacturer ID', () => {
      const manufacturerId = 'invalid-id';
      service.getProductsByManufacturer(manufacturerId).subscribe({
        next: () => fail('Expected an error, but got a response'),
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${baseUrl}/products?manufacturerId=${manufacturerId}`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
    });

    it('should handle error when uploading file to S3', () => {
      const uploadUrl = 'https://s3.amazonaws.com/bucket/image.png';
      const mockFile = new File([''], 'image.png', { type: 'image/png' });

      service.uploadToS3(uploadUrl, mockFile).subscribe({
        next: () => fail('Expected an error, but got a response'),
        error: (error) => {
          expect(error.status).toBe(403);
        }
      });

      const req = httpMock.expectOne(uploadUrl);
      req.flush('Forbidden', { status: 403, statusText: 'Forbidden' });
    });

    it('should handle error when retrieving warehouses', () => {
      service.getWarehouses().subscribe({
        next: () => fail('Expected an error, but got a response'),
        error: (error) => {
          expect(error.status).toBe(500);
        }
      });

      const req = httpMock.expectOne(`${baseUrl}/warehouses`);
      req.flush('Internal Server Error', { status: 500, statusText: 'Internal Server Error' });
    });

    it('should handle error when retrieving warehouses by country', () => {
      const country = 'invalid-country';
      service.getWarehouses(country).subscribe({
        next: () => fail('Expected an error, but got a response'),
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${baseUrl}/warehouses?country=${country}`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
    });
});


export class MockProductService {
  private baseUrl = 'https://mock-api.com';

  createProduct(product: any, imageFile?: File): Observable<any> {
    return of({ success: true, product });
  }

  getProducts(): Observable<any> {
    return of([]);
  }

  getProductById(productId: string): Observable<any> {
    return of({ id: productId, name: 'Mock Product' });
  }

  updateProduct(productId: string, product: any): Observable<any> {
    return of({ success: true });
  }

  getPresignedUrl(fileName: string): Observable<{ uploadUrl: string; publicUrl: string }> {
    return of({
      uploadUrl: `https://mock-s3.com/${fileName}`,
      publicUrl: `https://mock-s3.com/${fileName}`,
    });
  }

  uploadToS3(uploadUrl: string, file: File): Observable<any> {
    return of({ success: true });
  }

  getProductsByManufacturer(manufacturerId: string): Observable<Product[]> {
    return of([]);
  }

  sendProducts(products: any[]): Observable<any> {
    return of(products.map(product => ({ success: true, product })));
  }

  getWarehouses(): Observable<any> {
    return of([
      { id: '1', name: 'Mock Warehouse', country: 'Mock Country', location: 'Mock Location', description: 'Mock Description' },
    ]);
  }
}
