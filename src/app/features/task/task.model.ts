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
}