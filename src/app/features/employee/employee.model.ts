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

export const EmployeeConstants = {
  // Giới tính
  GENDER_MALE: 1, // Nam
  GENDER_FEMALE: 2, // Nữ
  GENDER_OTHER: 3, // Khác

  // Loại nhân viên
  TYPE_DIRECTOR: 1, // Giám đốc
  TYPE_MANAGER: 2, // Trưởng phòng
  TYPE_ACCOUNTANT: 3, // Kế toán
  TYPE_TEAM_LEADER: 4, // Trưởng nhóm
  TYPE_EMPLOYEE: 5, // Nhân viên
  TYPE_SOFTWARE_ENGINEER: 6, // Kỹ sư phần mềm
  TYPE_TESTER: 7, // Kiểm thử phần mềm

  // Trạng thái làm việc
  STATUS_WORKING: 1, // Đang làm
  STATUS_QUIT: 2, // Đã nghỉ

  // Hàm lấy tên giới tính
  getGenderName: (id: number): string => genders[id] ?? '',
  // Hàm lấy tên loại nhân viên
  getEmployeeTypeName: (id: number): string => employeeTypes[id] ?? '',
  // Hàm lấy tên trạng thái làm việc
  getWorkStatusName: (id: number): string => workStatuses[id] ?? '',

  // Hàm lấy danh sách giới tính
  getGenders: () => Object.entries(genders).map(([k, v]) => ({ label: v, value: parseInt(k) })),
  // Hàm lấy danh sách loại nhân viên
  getEmployeeTypes: () => Object.entries(employeeTypes).map(([k, v]) => ({ label: v, value: parseInt(k) })),
  // Hàm lấy danh sách trạng thái làm việc
  getWorkStatuses: () => Object.entries(workStatuses).map(([k, v]) => ({ label: v, value: parseInt(k) })),
};

const genders: Record<number, string> = {
  [EmployeeConstants.GENDER_MALE]: 'Nam',
  [EmployeeConstants.GENDER_FEMALE]: 'Nữ',
  [EmployeeConstants.GENDER_OTHER]: 'Khác',
};

const employeeTypes: Record<number, string> = {
  [EmployeeConstants.TYPE_DIRECTOR]: 'Giám đốc',
  [EmployeeConstants.TYPE_MANAGER]: 'Trưởng phòng',
  [EmployeeConstants.TYPE_ACCOUNTANT]: 'Kế toán',
  [EmployeeConstants.TYPE_TEAM_LEADER]: 'Trưởng nhóm',
  [EmployeeConstants.TYPE_EMPLOYEE]: 'Nhân viên',
  [EmployeeConstants.TYPE_SOFTWARE_ENGINEER]: 'Kỹ sư phần mềm',
  [EmployeeConstants.TYPE_TESTER]: 'Kiểm thử phần mềm',
};

const workStatuses: Record<number, string> = {
  [EmployeeConstants.STATUS_WORKING]: 'Đang làm',
  [EmployeeConstants.STATUS_QUIT]: 'Đã nghỉ',
};
