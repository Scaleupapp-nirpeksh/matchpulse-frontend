export interface Organization {
  id: string;
  _id?: string;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}
