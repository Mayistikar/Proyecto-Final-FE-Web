import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProductService } from './product.service';
import { Product } from '../../models/product.model';

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
});

