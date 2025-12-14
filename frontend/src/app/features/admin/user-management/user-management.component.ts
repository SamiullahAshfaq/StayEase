import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminService } from '../services/admin.service';
import { UserManagement } from '../services/admin.models';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.css'
})
export class UserManagementComponent implements OnInit {
  private adminService = inject(AdminService);

  users = signal<UserManagement[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  // Filters
  roleFilter = signal<string>('');
  statusFilter = signal<string>('');
  searchTerm = signal<string>('');

  // Pagination
  currentPage = signal(0);
  pageSize = signal(10);
  totalPages = signal(0);
  totalElements = signal(0);

  // Selected user for actions
  selectedUser = signal<UserManagement | null>(null);
  showUserModal = signal(false);
  showDeleteConfirm = signal(false);

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading.set(true);
    this.error.set(null);

    this.adminService.getUsers(
      this.currentPage(),
      this.pageSize(),
      this.roleFilter() || undefined,
      this.statusFilter() || undefined,
      this.searchTerm() || undefined
    ).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.users.set(response.data.content || []);
          this.totalPages.set(response.data.totalPages || 0);
          this.totalElements.set(response.data.totalElements || 0);
        }
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load users');
        this.loading.set(false);
      }
    });
  }

  onFilterChange() {
    this.currentPage.set(0);
    this.loadUsers();
  }

  onSearch() {
    this.currentPage.set(0);
    this.loadUsers();
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.loadUsers();
  }

  viewUser(user: UserManagement) {
    this.selectedUser.set(user);
    this.showUserModal.set(true);
  }

  editUser(user: UserManagement) {
    this.selectedUser.set(user);
    this.showUserModal.set(true);
  }

  confirmDelete(user: UserManagement) {
    this.selectedUser.set(user);
    this.showDeleteConfirm.set(true);
  }

  deleteUser() {
    const user = this.selectedUser();
    if (!user) return;

    const reason = prompt('Please provide a reason for suspending this user:');
    if (!reason) return;

    this.adminService.suspendUser(user.publicId, reason).subscribe({
      next: () => {
        this.showDeleteConfirm.set(false);
        this.selectedUser.set(null);
        this.loadUsers();
      },
      error: () => {
        this.error.set('Failed to suspend user');
      }
    });
  }

  updateUserStatus(userId: string, newStatus: string) {
    const reason = prompt('Please provide a reason for this status change:');
    if (!reason) return;

    const action$ = newStatus === 'SUSPENDED'
      ? this.adminService.suspendUser(userId, reason)
      : this.adminService.reactivateUser(userId, reason);

    action$.subscribe({
      next: () => {
        this.loadUsers();
        this.showUserModal.set(false);
      },
      error: () => {
        this.error.set('Failed to update user status');
      }
    });
  }

  closeModal() {
    this.showUserModal.set(false);
    this.showDeleteConfirm.set(false);
    this.selectedUser.set(null);
  }

  getRoleBadgeClass(role: string): string {
    const roleMap: Record<string, string> = {
      'ROLE_ADMIN': 'bg-purple-100 text-purple-800',
      'ROLE_LANDLORD': 'bg-blue-100 text-blue-800',
      'ROLE_GUEST': 'bg-green-100 text-green-800',
      'ROLE_SERVICE_PROVIDER': 'bg-orange-100 text-orange-800'
    };
    return roleMap[role] || 'bg-gray-100 text-gray-800';
  }

  getStatusBadgeClass(status: string): string {
    const statusMap: Record<string, string> = {
      'ACTIVE': 'bg-emerald-100 text-emerald-800',
      'INACTIVE': 'bg-gray-100 text-gray-800',
      'SUSPENDED': 'bg-red-100 text-red-800',
      'PENDING': 'bg-yellow-100 text-yellow-800'
    };
    return statusMap[status] || 'bg-gray-100 text-gray-800';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}
