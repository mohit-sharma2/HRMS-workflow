export type Role = 'Employee' | 'Manager' | 'HR' | 'Admin';

export interface HRMSUser {
  email: string;
  name: string;
  role: Role;
  avatar?: string;
  department?: string;
  designation?: string;
  employeeId?: string;
  joinDate?: string;
}

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  roles: Role[];
}