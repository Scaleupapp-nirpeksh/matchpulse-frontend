export interface Tournament {
  id: string;
  _id?: string;
  organizationId: string;
  name: string;
  description?: string;
  logoUrl?: string;
  sportType: string;
  format: string;
  status: string;
  rulesConfig?: Record<string, unknown>;
  startDate?: string;
  endDate?: string;
  venues?: { name: string; address?: string }[];
  maxTeams?: number;
  numGroups?: number;
  teamsPerGroup?: number;
  teamsAdvancing?: number;
  seeding?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
