// src/app/models/product.model.ts
export class Product {
    id: string;
    name: string;
    description: string;
    category: string;
    price: number;
    imageUrl: string;
    stock: number;
    sku: string;
    expirationDate: string;
    deliveryTime: number;
    storageConditions: string;
    commercialConditions: string;
    isPerishable: boolean;
  
    constructor(
      id: string = '',
      name: string = '',
      description: string = '',
      category: string = '',
      price: number = 0,
      imageUrl: string = '',
      stock: number = 0,
      sku: string = '',
      expirationDate: string = '',
      deliveryTime: number = 0,
      storageConditions: string = '',
      commercialConditions: string = '',
      isPerishable: boolean = false
    ) {
      this.id = id;
      this.name = name;
      this.description = description;
      this.category = category;
      this.price = price;
      this.imageUrl = imageUrl;
      this.stock = stock;
      this.sku = sku;
      this.expirationDate = expirationDate;
      this.deliveryTime = deliveryTime;
      this.storageConditions = storageConditions;
      this.commercialConditions = commercialConditions;
      this.isPerishable = isPerishable;
    }
  }  