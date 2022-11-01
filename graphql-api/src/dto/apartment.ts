export type Task = {
  id: string;
  name: string;
  description: string;
  frequency: number;
  start: string;
  end?: string;
  assignees: string[];
  createdBy: string;
};

export enum MembershipRole {
  ADMIN = "ADMIN",
  NORMAL = "NORMAL",
}

export type Membership = {
  userId: string;
  role: MembershipRole;
};

export type Apartment = {
  id: string;
  name: string;
  tasks: Task[];
  members: Membership[];
};
