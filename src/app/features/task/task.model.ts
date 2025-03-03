// Định nghĩa interface Task
export interface Task {
    id: number; // Mã định danh của nhiệm vụ
    name: string; // Tên nhiệm vụ
    description: string; // Mô tả nhiệm vụ
    priority: number; // Mức độ ưu tiên của nhiệm vụ
    department: number; // Phòng ban thực hiện nhiệm vụ
    dueDate: string; // Ngày hết hạn của nhiệm vụ
    assignee: string; // Người được giao nhiệm vụ
    status: { id: number, name: string }; // Trạng thái của nhiệm vụ
    showDescription?: boolean;
}

export const TaskStatusConstants = {
    // Trạng thái công việc
    STATUS_NEW: 1, // Mới
    STATUS_IN_PROGRESS: 2, // Đang làm
    STATUS_DONE: 3, // Đã làm xong
    STATUS_REVIEWED: 4, // Đã kiểm tra
    STATUS_FEEDBACK: 5, // Phản hồi
    STATUS_CLOSED: 6, // Đóng
  
    // Hàm lấy tên trạng thái công việc
    getStatusName: (id: number): string => TaskStatuses[id] ?? '',
  
    // Hàm lấy danh sách trạng thái công việc
    getStatuses: () => Object.entries(TaskStatuses).map(([k, v]) => ({ name: v, id: parseInt(k) })),
  };
  
  const TaskStatuses: Record<number, string> = {
    [TaskStatusConstants.STATUS_NEW]: 'Mới',
    [TaskStatusConstants.STATUS_IN_PROGRESS]: 'Đang làm',
    [TaskStatusConstants.STATUS_DONE]: 'Đã làm xong',
    [TaskStatusConstants.STATUS_REVIEWED]: 'Đã kiểm tra',
    [TaskStatusConstants.STATUS_FEEDBACK]: 'Phản hồi',
    [TaskStatusConstants.STATUS_CLOSED]: 'Đóng',
  };