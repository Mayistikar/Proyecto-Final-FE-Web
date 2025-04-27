import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ActivatedRoute, Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {UploadProductComponent} from './upload-product.component';
import {ProductService } from '../services/product.service';
import { MockProductService } from '../services/product.service.spec';
import {of} from "rxjs";
import {AuthService, MockAuthService} from '../../auth/auth.service';


describe('UploadProductComponent', () => {
  let component: UploadProductComponent;
  let fixture: ComponentFixture<UploadProductComponent>;
  let productService: jasmine.SpyObj<ProductService>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;
  let router: jasmine.SpyObj<Router>;
  let translateService: jasmine.SpyObj<TranslateService>;

  beforeEach(async () => {
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const translateServiceSpy = jasmine.createSpyObj('TranslateService', ['instant']);
    const activatedRouteSpy = {snapshot: {params: {}}}; // Mock ActivatedRoute
    // spyOn(window.location, 'reload').and.callFake(() => {});

    await TestBed.configureTestingModule({
      imports: [UploadProductComponent], // Add the standalone component here
      providers: [
        {provide: ProductService, useClass: MockProductService},
        {provide: MatSnackBar, useValue: snackBarSpy},
        {provide: Router, useValue: routerSpy},
        {provide: TranslateService, useValue: translateServiceSpy},
        {provide: ActivatedRoute, useValue: activatedRouteSpy}, // Provide mock ActivatedRoute
        {provide: AuthService, useClass: MockAuthService},
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UploadProductComponent);
    component = fixture.componentInstance;
    productService = TestBed.inject(ProductService) as jasmine.SpyObj<ProductService>;
    snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    translateService = TestBed.inject(TranslateService) as jasmine.SpyObj<TranslateService>;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should clean the data when clean() is called', () => {
    component.jsonData = [{name: 'Test'}];
    component.isFileUploaded = true;
    component.fileErrors = ['Error'];

    component.clean();

    expect(component.jsonData).toEqual([]);
    expect(component.isFileUploaded).toBeFalse();
    expect(component.fileErrors).toEqual([]);
  });

  it('should process a valid CSV file and set jsonData', () => {
    const mockEvent = {
      target: {
        files: [new Blob(['name;description;category;price;currency;stock;sku;expirationDate;deliveryTime;storageConditions;commercialConditions;isPerishable\nProduct A;Description A;Category A;10.5;USD;100;SKU001;2023-12-31;5;Dry;FOB;TRUE'], {type: 'text/csv'})]
      }
    } as unknown as Event;

    component.uploadFile(mockEvent);

    expect(component.jsonData).toEqual([]);
  });

  it('should alert if there are no products to upload', () => {
    spyOn(window, 'alert');
    spyOn(productService, 'sendProducts'); // Convert sendProducts into a spy
    component.jsonData = []; // No products to upload

    component.uploadProducts();

    expect(window.alert).toHaveBeenCalledWith('No products to upload.');
    expect(productService.sendProducts).not.toHaveBeenCalled();
  });

  it('should reset jsonData, fileErrors, and isFileUploaded when deleteFile() is called', () => {
    component.jsonData = [{name: 'Test Product'}];
    component.fileErrors = ['Error 1'];
    component.isFileUploaded = true;

    component.deleteFile();

    expect(component.jsonData).toEqual([]);
    expect(component.fileErrors).toEqual([]);
    expect(component.isFileUploaded).toBeFalse();
  });

  it('should alert when jsonData is empty', () => {
    spyOn(window, 'alert');
    spyOn(productService, 'sendProducts'); // Asegúrate de que sendProducts sea un espía
    component.jsonData = []; // No products to upload

    component.uploadProducts();

    expect(window.alert).toHaveBeenCalledWith('No products to upload.');
    expect(productService.sendProducts).not.toHaveBeenCalled();
  });

  it('should call productService.sendProducts and handle success and error cases', () => {
    const mockJsonData = [{name: 'Test Product'}];
    component.jsonData = mockJsonData;

    productService.sendProducts = jasmine.createSpy().and.returnValue(of({})); // Define sendProducts as a spy

    component.uploadProducts();

    expect(component.isUploading).toBeFalse();
  });

  it('should create a download link and trigger a click event', () => {
    spyOn(document, 'createElement').and.callThrough();
    const clickSpy = spyOn(HTMLAnchorElement.prototype, 'click');

    component.downloadFile();

    expect(document.createElement).toHaveBeenCalledWith('a');
    expect(clickSpy).toHaveBeenCalled();
  });
});
