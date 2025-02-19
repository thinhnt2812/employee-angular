export interface Department {
    id: number;
    name: string;
    description: string;
    workStatus: { id: number, name: string };
}

export const DepartmentConstants = {
    // Trạng thái làm việc
    STATUS_ACTIVE: 1, // Đang hoạt động
    STATUS_STOP: 2, // Đã dừng hoạt động
  
    // Hàm lấy tên trạng thái phòng ban
    getStatusName: (id: number): string => Statuses[id] ?? '',
  
    // Hàm lấy danh sách trạng thái làm việc
    getStatuses: () => Object.entries(Statuses).map(([k, v]) => ({ label: v, value: parseInt(k) })),
  };
  
  const Statuses: Record<number, string> = {
    [DepartmentConstants.STATUS_ACTIVE]: 'Đang hoạt động',
    [DepartmentConstants.STATUS_STOP]: 'Đã dừng',
  };
  