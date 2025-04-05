// seller.model.ts
export class Seller {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    zone: string;
    specialty: string;
    password: string;
  
    constructor(
      id: string = '',
      name: string = '',
      email: string = '',
      phone: string = '',
      address: string = '',
      zone: string = '',
      specialty: string = '',
      password: string = ''
    ) {
      this.id = id;
      this.name = name;
      this.email = email;
      this.phone = phone;
      this.address = address;
      this.zone = zone;
      this.specialty = specialty;
      this.password = password;
    }
 
  }