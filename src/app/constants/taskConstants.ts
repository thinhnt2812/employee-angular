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
    getStatuses: () => Object.entries(TaskStatuses).map(([k, v]) => ({ label: v, value: parseInt(k) })),
  };
  
  const TaskStatuses: Record<number, string> = {
    [TaskStatusConstants.STATUS_NEW]: 'Mới',
    [TaskStatusConstants.STATUS_IN_PROGRESS]: 'Đang làm',
    [TaskStatusConstants.STATUS_DONE]: 'Đã làm xong',
    [TaskStatusConstants.STATUS_REVIEWED]: 'Đã kiểm tra',
    [TaskStatusConstants.STATUS_FEEDBACK]: 'Phản hồi',
    [TaskStatusConstants.STATUS_CLOSED]: 'Đóng',
  };