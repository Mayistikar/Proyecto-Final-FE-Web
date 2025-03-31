import { TestBed } from '@angular/core/testing';
import { SellerService } from './seller.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('Service: Seller', () => {
  let service: SellerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SellerService]
    });

    service = TestBed.inject(SellerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

