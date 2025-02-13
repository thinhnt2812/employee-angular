export interface Employee {
  createdAt?: string; // Ngày tạo
  id: number; // Mã nhân viên
  name: string; // Tên nhân viên
  gender: number; // Giới tính
  hometown: string; // Quê quán
  dob: string; // Ngày sinh
  phone: string; // Số điện thoại
  employeeType: number; // Loại nhân viên
  department: number; // Phòng ban
  workStatus: number; // Trạng thái làm việc
}